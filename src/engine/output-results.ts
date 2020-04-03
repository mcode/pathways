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
    patientDocumentation[stateData.documentation.state] = retrieveResource(
      stateData.documentation,
      resources
    );
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
    documentation: patientDocumentation,
    path: Object.entries(patientDocumentation).map(documentationDict => {
      const [, documentationResource] = documentationDict;
      return documentationResource.state;
    })
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
 * Helper function to select the transition state
 * This function is needed because MedicationRequests can have multiple
 * different statuses to indiciate complete
 * @param resource - the resource returned by the CQL execution
 * @param currentState - the current state
 * @return the next state name or null
 */
function formatNextState(resource: DocumentationResource, currentState: State): string[] {
  if (resource.resourceType === 'MedicationRequest') {
    return currentState.transitions.length !== 0 ? [currentState.transitions[0].transition] : [];
  } else {
    return resource.status === 'completed' && currentState.transitions.length !== 0
      ? [currentState.transitions[0].transition]
      : [];
  }
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
            resource: documentReference
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
        nextStates: formatNextState(resource, currentState),
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
          resource: documentReference
        };
        return {
          nextStates: formatNextState(doc, currentState),
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
      documentation: { state: currentStateName },
      status: 'completed'
    };
  } else if (currentState.transitions.length > 1) {
    return getConditionalNextState(patientData, currentState, currentStateName, resources);
  } else return null;
}

function retrieveNote(condition: string, resources: DomainResource[]): DocumentReference | null {
  const documentReference = resources.find(resource => {
    if (resource.resourceType !== 'DocumentReference') return false;
    const documentReference = resource as DocumentReference;
    if (documentReference.identifier === undefined) return false;
    for (const identifier of documentReference.identifier) {
      if (
        identifier.system === 'pathways.documentreference' &&
        identifier.value === btoa(condition)
      )
        return true;
    }
    return false;
  });

  if (!documentReference) return null;

  return documentReference as DocumentReference;
}

function retrieveResource(doc: Documentation, resources: DomainResource[]): Documentation {
  if ('resourceType' in doc && resources) {
    (doc as DocumentationResource).resource = resources.find(resource => {
      return (
        resource.resourceType === (doc as DocumentationResource).resourceType &&
        resource.id === (doc as DocumentationResource).id
      );
    });
  }

  return doc;
}
