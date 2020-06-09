/* eslint-disable guard-for-in */
/* eslint-disable max-len */

import {
  Pathway,
  PathwayResults,
  PatientData,
  CriteriaResult,
  DocumentationResource,
  State,
  GuidanceState,
  CriteriaResultItem,
  Documentation
} from 'pathways-model';
import { DocumentReference, DomainResource } from 'fhir-objects';
import { retrieveNote } from 'utils/fhirUtils';

interface StateData {
  documentation: Documentation;
  nextStates: string[];
  status: string;
}

/**
 * Engine function to take in the ELM patient results and output data relating to the patient's pathway
 * @param pathway - the entire pathway
 * @param patientData - the data on the patient from a CQL execution. Note this is a single patient not the entire patientResults object
 * @return returns PathwayResults describing
 */
export function pathwayData(
  pathway: Pathway,
  patientData: PatientData,
  resources: DomainResource[]
): PathwayResults {
  const startState = 'Start';
  const patientDocumentation: { [key: string]: Documentation } = {};

  let currentStates = [startState];
  let stateData = nextState(pathway, patientData, startState, resources);
  while (stateData !== null) {
    if (stateData.documentation === null) break;
    const documentation = stateData.documentation;
    documentation.onPath = true;
    (documentation as DocumentationResource).resource = retrieveResource(
      stateData.documentation,
      resources
    );
    patientDocumentation[stateData.documentation.state] = { ...documentation };
    if (stateData.nextStates.length === 0) break;
    else if (stateData.nextStates.length === 1) {
      currentStates = stateData.nextStates;
      stateData = nextState(pathway, patientData, stateData.nextStates[0], resources);
    } else {
      // There are multiple transitions
      // Check if any of them have been done
      currentStates = [];
      const completedStates: string[] = [];
      for (const stateName of stateData.nextStates) {
        const documentReference = retrieveNote(pathway.states[stateName].label, resources);
        if (!documentReference && (!patientData[stateName] || !patientData[stateName].length)) {
          currentStates.push(stateName);
        } else {
          completedStates.push(stateName);
        }
      }

      if (completedStates.length !== 0) {
        currentStates = completedStates;
      } else if (currentStates.length === 0) {
        currentStates = stateData.nextStates;
        break;
      }

      // TODO: there is a possibility multiple states match
      const currentStateName = completedStates.length ? completedStates[0] : currentStates[0];
      stateData = nextState(pathway, patientData, currentStateName, resources);
    }
  }
  return {
    patientId: patientData.Patient.id.value,
    currentStates: currentStates,
    documentation: getAllDocumentation(pathway, patientData, resources, patientDocumentation)
  };
}

/**
 * Engine function to take in the ELM patient results and output data relating to the pathway criteria
 * @param pathway - the entire pathway
 * @param patientData - the data on the patient from a CQL execution. Note this is a single patient not the entire patientResults object
 * @return returns CriteriaResult containing the expected and actual value for one data element
 */
export function criteriaData(pathway: Pathway, patientData: PatientData): CriteriaResult {
  const resultItems: CriteriaResultItem[] = [];

  let matches = 0;
  pathway.criteria.forEach(criteria => {
    let evaluationResult = patientData[criteria.elementName];
    if (Array.isArray(evaluationResult)) {
      evaluationResult = evaluationResult[0]; // TODO: add functionality for multiple resources
    }
    let actual = 'unknown';
    let match = false;

    if (evaluationResult) {
      actual = evaluationResult['value'];
      match = evaluationResult['match'];
    }

    if (match) matches += 1;

    const criteriaResultItem = {
      elementName: criteria.elementName,
      expected: criteria.expected,
      actual,
      match
    };

    resultItems.push(criteriaResultItem);
  });

  return {
    pathwayName: pathway.name,
    matches: matches,
    criteriaResultItems: resultItems
  };
}

/**
 * Helper function to obtain documentation for any states not on the path
 * @param pathway - the entire pathway
 * @param patientData - the data on the patient
 * @param resources - the patient resources
 * @param patientDocumentation - the documentation dictionary from states on the patient path
 */
function getAllDocumentation(
  pathway: Pathway,
  patientData: PatientData,
  resources: DomainResource[],
  patientDocumentation: { [key: string]: Documentation }
): { [key: string]: Documentation } {
  const statesWithDocumentation = Object.values(patientDocumentation)
    .filter(doc => doc.onPath)
    .map(doc => doc.state);
  for (const [stateName, state] of Object.entries(pathway.states)) {
    if (!statesWithDocumentation.includes(stateName)) {
      if ('action' in state) {
        // If action check for resource
        if (patientData[stateName] && patientData[stateName].length) {
          const documentation = patientData[stateName][0];
          documentation.state = stateName;
          documentation.onPath = false;
          (documentation as DocumentationResource).resource = retrieveResource(
            documentation,
            resources
          );
          patientDocumentation[stateName] = { ...documentation };
        }
      } else {
        // Tranisition element must check each transition in patient data for existence
        for (const transition of (state as State).transitions) {
          if (!transition.condition) continue;

          if (
            patientData[transition.condition.description] &&
            patientData[transition.condition.description].length
          ) {
            const documentation = patientData[transition.condition.description][0];
            documentation.state = stateName;
            documentation.onPath = false;
            (documentation as DocumentationResource).resource = retrieveResource(
              documentation,
              resources
            );
            patientDocumentation[stateName] = { ...documentation };
          } else {
            // Check for document reference note
            const documentReference = retrieveNote(transition.condition.description, resources);
            if (documentReference) {
              const documentation = {
                resourceType: 'DocumentReference',
                status: documentReference.status,
                id: documentReference.id,
                state: stateName,
                onPath: false,
                resource: documentReference
              };
              patientDocumentation[stateName] = { ...documentation };
            }
          }
        }
      }
    }
  }
  return patientDocumentation;
}

/**
 * Helper function to format the documentation and include the related state
 * @param resource - the resource returned by the CQL execution
 * @param state - the current state name
 * @return the JSON resource with the state property set
 */
function formatDocumentation(
  resource: DocumentationResource,
  state: string
): DocumentationResource {
  resource.state = state;
  return resource;
}

/**
 * Helper function to determine whether the action represented by
 * the given resource has been "completed", and the pathway execution should advance.
 * @param resource - the FHIR resource for a given action
 * @return boolean as to whether this resource is complete
 */
function isComplete(resource: DocumentationResource): boolean {
  // placeholder for more complex logic if needed.
  // as of today MedicationRequest and ServiceRequest should both be "completed"
  // (MedicationRequest can also be "stopped" though that indicates
  // "Actions implied by the prescription are to be permanently halted, **before all of them occurred.**")
  return resource.status === 'completed';
}

/**
 * Helper function to determine whether current state should be skipped and pathway execution should advance
 * Checks for DocumentReference resource with state label and advance
 * @param currentState current state
 * @param resources list of patient resources
 * @return boolean as to whether pathway execution should advance
 */
function shouldAdvance(currentState: State, resources: DomainResource[]): boolean {
  return resources.some(r => {
    if (r.resourceType !== 'DocumentReference') return false;
    const content = (r as DocumentReference).content[0].attachment.data;
    if (content) {
      const convertedContent = atob(content);
      return convertedContent === `${currentState.label} - Advance`;
    }

    return false;
  });
}

/**
 * Helper function to select the transition state
 * @param resource - the resource returned by the CQL execution
 * @param currentState - the current state
 * @param resources list of patient resources
 * @return the next state name or null
 */
function formatNextState(
  resource: DocumentationResource,
  currentState: State,
  resources: DomainResource[]
): string[] {
  return (shouldAdvance(currentState, resources) || isComplete(resource)) &&
    currentState.transitions.length !== 0
    ? [currentState.transitions[0].transition]
    : [];
}

/**
 * Determine the nextState in a conditional transition state
 * @param patientData - JSON object representing the data on a patient
 * @param currentState - the current state
 * @param currentStateName - the name of the current state
 * @return the next state
 */
function getConditionalNextState(
  patientData: PatientData,
  currentState: State,
  currentStateName: string,
  resources: DomainResource[]
): StateData | null {
  const documentation: DocumentationResource[] = [];
  const nextStates: string[] = [];
  for (const transition of currentState.transitions) {
    if (transition.condition) {
      let currentTransitionDocumentation: DocumentationResource | null = null;
      if (patientData[transition.condition.description]?.length)
        // TODO: add functionality for multiple resources
        currentTransitionDocumentation = patientData[transition.condition.description][0];
      else {
        const documentReference = retrieveNote(transition.condition.description, resources);
        if (documentReference) {
          currentTransitionDocumentation = {
            resourceType: 'DocumentReference',
            id: documentReference.id ? documentReference.id : 'unknown',
            status: documentReference.status,
            state: currentStateName,
            resource: documentReference,
            onPath: true
          };
        }
      }

      if (currentTransitionDocumentation) {
        nextStates.push(transition.transition);
        documentation.push(currentTransitionDocumentation);
      }
    }
  }

  if (nextStates.length && documentation.length)
    return {
      nextStates: nextStates,
      documentation: formatDocumentation(documentation[0], currentStateName),
      status: documentation[0].status
    };
  else return null;
}

/**
 * Helper function to traverse the pathway and determine the next state in a patients pathway.
 * For actions this function will also verify the move is valid by the resource status
 * @param pathway - JSON object representing the complete pathway
 * @param patientData - JSON object representing the data on a patient
 * @param currentStateName - the name of the current state in the traversal
 * @return returns object with the next state, the status, and the evidenvce
 */
function nextState(
  pathway: Pathway,
  patientData: PatientData,
  currentStateName: string,
  resources: DomainResource[]
): StateData | null {
  const currentState: State | GuidanceState = pathway.states[currentStateName];
  if ('action' in currentState) {
    let resource = patientData[currentStateName];
    if (resource?.length) {
      resource = resource[0]; // TODO: add functionality for multiple resources
      return {
        nextStates: formatNextState(resource, currentState, resources),
        documentation: formatDocumentation(resource, currentStateName),
        status: 'status' in resource ? resource.status : 'unknown'
      };
    } else {
      // Check for note posted on decline
      const documentReference = retrieveNote(currentState.label, resources);
      if (documentReference) {
        const doc = {
          resourceType: 'DocumentReference',
          id: documentReference.id ? documentReference.id : 'unknown',
          status: 'status' in documentReference ? documentReference.status : 'unknown',
          state: currentStateName,
          resource: documentReference,
          onPath: true
        };
        return {
          nextStates: formatNextState(doc, currentState, resources),
          documentation: formatDocumentation(doc, currentStateName),
          status: doc.status
        };
      }
      // Action exists but has no matching resource in patientData
      return null;
    }
  } else if (currentState.transitions.length === 1) {
    return {
      nextStates: [currentState.transitions[0].transition],
      documentation: { state: currentStateName, onPath: true },
      status: 'completed'
    };
  } else if (currentState.transitions.length > 1) {
    return getConditionalNextState(patientData, currentState, currentStateName, resources);
  } else return null;
}

/**
 * Helper function to retrieve a resource for documentation if one exists.
 * @param doc - the docuumentation to find a resource for
 * @param resources - the list of patient resources
 * @return DomainResource for the documentation or undefined if none found
 */
function retrieveResource(
  doc: Documentation,
  resources: DomainResource[]
): DomainResource | undefined {
  let resource: DomainResource | undefined = undefined;
  if ('resourceType' in doc && resources) {
    resource = resources.find(resource => {
      return (
        resource.resourceType === (doc as DocumentationResource).resourceType &&
        resource.id === (doc as DocumentationResource).id
      );
    });
  }

  return resource;
}
