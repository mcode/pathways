/* eslint-disable guard-for-in */
/* eslint-disable max-len */

import {
  Pathway,
  PathwayResults,
  PatientData,
  PreconditionResult,
  DocumentationResource,
  PathwayNode,
  ActionNode,
  PreconditionResultItem,
  Documentation
} from 'pathways-model';
import { DocumentReference, DomainResource } from 'fhir-objects';
import { retrieveNote } from 'utils/fhirUtils';

interface NodeData {
  documentation: Documentation;
  nextNodes: string[];
  status: string;
}

export function pathwayData(
  pathway: Pathway,
  patientData: PatientData,
  resources: DomainResource[]
): PathwayResults {
  const startNode = 'Start';
  let currentNodes: string[] = [];
  let nextNodes: string[] = [startNode];
  const documentation: { [key: string]: Documentation } = {};

  // think of this function like a proof by induction:
  // - basis: we start at the start node
  // - recursive: we know the current node(s) we are on, find the next ones
  // if there are next ones, repeat the process with those, until we don't find any next steps
  // then our "current node(s)" at the end, are the current step shown to the user

  do {
    currentNodes = nextNodes;
    nextNodes = [];
    // this should work whether there are 1 or many current nodes
    // find the first one that is complete or in-progress
    // and get the next nodes from that
    // if there are none, then we stick with the current nodes
    for (const nodeKey of currentNodes) {
      const currentNode = pathway.nodes[nodeKey];
      const [status, resource] = getStatusAndResource(currentNode, patientData, resources);
      if (status === 'completed' || resource) {
        documentation[nodeKey] = { node: nodeKey, onPath: true };
        if (resource) {
          const dr = documentation[nodeKey] as DocumentationResource;
          dr.resourceType = resource.resourceType ?? '';
          dr.id = resource.id ?? ''; // these should never be null in practice

          dr.status = 'status' in resource ? resource['status'] : 'unknown'; // TODO
          // finally get the actual resource;
          // until here `resource` is just a "stub" of id/resourceType
          dr.resource = retrieveResource(dr, resources);
        }

        if (status === 'completed') {
          nextNodes = getNextNodes(currentNode, patientData, resources, resource);
        } else {
          currentNodes = [nodeKey];
          nextNodes = [];
        }

        break;
      }
    }
  } while (nextNodes.length !== 0);

  // do a second pass of any nodes without documentation to see if they are complete
  getNonPathDocumentation(pathway, patientData, resources, documentation);

  return {
    patientId: patientData.Patient.id.value,
    currentNodes,
    documentation
  };
}

function getStatusAndResource(
  currentNode: PathwayNode,
  patientData: PatientData,
  resources: DomainResource[]
): [string, DomainResource | null] {
  let status = '';
  let resource: DomainResource | null = null;

  switch (currentNode.type) {
    case 'start':
      status = 'completed'; // start node always complete
      break;
    case 'action': {
      const data = patientData[currentNode.key];

      let actionResource: DomainResource | null = null;
      if (Array.isArray(data)) {
        if (data.length > 0) {
          actionResource = data[0];
        }
      } else if (data) {
        actionResource = data;
      }

      if (actionResource) {
        resource = actionResource;
        status = 'status' in resource ? resource['status'] : 'completed'; // TODO
      } else {
        resource = retrieveNote(currentNode.label, resources);
      }

      // finally check for "advance" notes
      if (status !== 'completed' && shouldAdvance(currentNode, resources)) {
        status = 'completed';
      }

      break;
    }

    case 'branch': {
      // first see if any of the transition conditions evaluated to true
      const hasAnyTrue = currentNode.transitions.some(
        t => t?.condition?.description && patientData[t?.condition?.description]
      );

      if (hasAnyTrue) {
        status = 'completed';
      } else {
        // if none are true, look for a DocRef to see if a specific path was chosen
        // (note that we don't care which one it is here, but store the doc anyway,
        //  so that we can use it later without looking it up all over again)
        const branchNote = currentNode.transitions
          .map(t => t?.condition && retrieveNote(t.condition.description, resources))
          .find(n => n);
        if (branchNote) {
          status = 'completed';
          resource = branchNote;
        }
      }
      break;
    }

    default:
      // 'null' or 'reference'
      // TODO: how do we want to handle references?
      // we should never hit a null in practice here
      status = 'not-started';
  }

  return [status, resource];
}

function getNextNodes(
  currentNode: PathwayNode,
  patientData: PatientData,
  resources: DomainResource[],
  resource: DomainResource | null
): string[] {
  // IMPORTANT -- this function assumes that the current node is complete

  let nextNodes: string[] = [];
  // type: 'action' | 'branch' | 'reference' | 'start' | 'null';
  switch (currentNode.type) {
    case 'start':
    case 'action':
      // conditionals not allowed here
      nextNodes = currentNode.transitions.map(t => t.transition);
      break;

    case 'branch': {
      let noteChoice: string | undefined = undefined;

      if (resource?.resourceType === 'DocumentReference') {
        const note = resource as DocumentReference;
        if (note?.identifier && note.identifier[0]?.value) {
          noteChoice = atob(note.identifier[0].value);
        }
      }

      nextNodes = currentNode.transitions
        .filter(t => {
          // either it matches by CQL, or it's the one the user previously chose
          // (note that we don't currently allow for overriding CQL matches)
          return (
            t?.condition?.description &&
            (patientData[t.condition.description] || t.condition.description === noteChoice)
          );
        })
        .map(t => t.transition);

      break;
    }
    default:
      // 'null' or 'reference'
      // TODO: how do we want to handle references?
      // we should never hit a null in practice here
      nextNodes = [];
      break;
  }
  return nextNodes;
}

/**
 * Engine function to take in the ELM patient results and output data relating to the patient's pathway
 * @param pathway - the entire pathway
 * @param patientData - the data on the patient from a CQL execution. Note this is a single patient not the entire patientResults object
 * @return returns PathwayResults describing
 */
export function pathwayDataOld(
  pathway: Pathway,
  patientData: PatientData,
  resources: DomainResource[]
): PathwayResults {
  const startNode = 'Start';
  const patientDocumentation: { [key: string]: Documentation } = {};

  let currentNodes = [startNode];
  let nodeData = nextNode(pathway, patientData, startNode, resources);
  while (nodeData !== null) {
    if (nodeData.documentation === null) break;
    const documentation = nodeData.documentation;
    documentation.onPath = true;
    (documentation as DocumentationResource).resource = retrieveResource(
      nodeData.documentation,
      resources
    );
    patientDocumentation[nodeData.documentation.node] = { ...documentation };
    if (nodeData.nextNodes.length === 0) break;
    else if (nodeData.nextNodes.length === 1) {
      currentNodes = nodeData.nextNodes;
      nodeData = nextNode(pathway, patientData, nodeData.nextNodes[0], resources);
    } else {
      // There are multiple transitions
      // Check if any of them have been done
      currentNodes = [];
      const completedNodes: string[] = [];
      for (const nodeKey of nodeData.nextNodes) {
        const documentReference = retrieveNote(pathway.nodes[nodeKey].label, resources);
        if (!documentReference && (!patientData[nodeKey] || !patientData[nodeKey].length)) {
          currentNodes.push(nodeKey);
        } else {
          completedNodes.push(nodeKey);
        }
      }

      if (completedNodes.length !== 0) {
        currentNodes = completedNodes;
      } else if (currentNodes.length === 0) {
        currentNodes = nodeData.nextNodes;
        break;
      }

      // TODO: there is a possibility multiple nodes match
      const currentNodeKey = completedNodes.length ? completedNodes[0] : currentNodes[0];
      nodeData = nextNode(pathway, patientData, currentNodeKey, resources);
    }
  }
  getNonPathDocumentation(pathway, patientData, resources, patientDocumentation);
  return {
    patientId: patientData.Patient.id.value,
    currentNodes: currentNodes,
    documentation: patientDocumentation
  };
}

/**
 * Engine function to take in the ELM patient results and output data relating to the pathway preconditions
 * @param pathway - the entire pathway
 * @param patientData - the data on the patient from a CQL execution. Note this is a single patient not the entire patientResults object
 * @return returns PreconditionResult containing the expected and actual value for one data element
 */
export function preconditionData(pathway: Pathway, patientData: PatientData): PreconditionResult {
  const resultItems: PreconditionResultItem[] = [];

  let matches = 0;
  pathway.preconditions.forEach(precondition => {
    let evaluationResult = patientData[precondition.elementName];
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

    const preconditionResultItem = {
      elementName: precondition.elementName,
      expected: precondition.expected,
      actual,
      match
    };

    resultItems.push(preconditionResultItem);
  });

  return {
    pathwayName: pathway.name,
    matches: matches,
    preconditionResultItems: resultItems
  };
}

/**
 * Helper function to obtain documentation for any nodes not on the path
 * @param pathway - the entire pathway
 * @param patientData - the data on the patient
 * @param resources - the patient resources
 * @param patientDocumentation - the documentation dictionary from nodes on the patient path
 */
function getNonPathDocumentation(
  pathway: Pathway,
  patientData: PatientData,
  resources: DomainResource[],
  patientDocumentation: { [key: string]: Documentation }
): void {
  const nodesWithDocumentation = Object.values(patientDocumentation)
    .filter(doc => doc.onPath)
    .map(doc => doc.node);
  for (const [nodeKey, node] of Object.entries(pathway.nodes)) {
    if (!nodesWithDocumentation.includes(nodeKey)) {
      if ('action' in node) {
        // If action check for resource
        if (patientData[nodeKey] && patientData[nodeKey].length) {
          const documentation = patientData[nodeKey][0];
          documentation.node = nodeKey;
          documentation.onPath = false;
          (documentation as DocumentationResource).resource = retrieveResource(
            documentation,
            resources
          );
          patientDocumentation[nodeKey] = { ...documentation };
        }
      } else {
        // Tranisition element must check each transition in patient data for existence
        for (const transition of (node as PathwayNode).transitions) {
          if (!transition.condition) continue;

          if (
            patientData[transition.condition.description] &&
            patientData[transition.condition.description].length
          ) {
            const documentation = patientData[transition.condition.description][0];
            documentation.node = nodeKey;
            documentation.onPath = false;
            (documentation as DocumentationResource).resource = retrieveResource(
              documentation,
              resources
            );
            patientDocumentation[nodeKey] = { ...documentation };
          } else {
            // Check for document reference note
            const documentReference = retrieveNote(transition.condition.description, resources);
            if (documentReference) {
              const documentation = {
                resourceType: 'DocumentReference',
                status: documentReference.status,
                id: documentReference.id,
                node: nodeKey,
                onPath: false,
                resource: documentReference
              };
              patientDocumentation[nodeKey] = { ...documentation };
            }
          }
        }
      }
    }
  }
}

/**
 * Helper function to format the documentation and include the related node
 * @param resource - the resource returned by the CQL execution
 * @param node - the current node name
 * @return the JSON resource with the node property set
 */
function formatDocumentation(resource: DocumentationResource, node: string): DocumentationResource {
  resource.node = node;
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
 * Helper function to determine whether current node should be skipped and pathway execution should advance
 * Checks for DocumentReference resource with node label and advance
 * @param currentNode current node
 * @param resources list of patient resources
 * @return boolean as to whether pathway execution should advance
 */
function shouldAdvance(currentNode: PathwayNode, resources: DomainResource[]): boolean {
  return resources.some(r => {
    if (r.resourceType !== 'DocumentReference') return false;
    const content = (r as DocumentReference).content[0].attachment.data;
    if (content) {
      const convertedContent = atob(content);
      return convertedContent === `${currentNode.label} - Advance`;
    }

    return false;
  });
}

/**
 * Helper function to select the transition node
 * @param resource - the resource returned by the CQL execution
 * @param currentNode - the current node
 * @param resources list of patient resources
 * @return the next node name or null
 */
function formatNextNode(
  resource: DocumentationResource,
  currentNode: PathwayNode,
  resources: DomainResource[]
): string[] {
  return (shouldAdvance(currentNode, resources) || isComplete(resource)) &&
    currentNode.transitions.length !== 0
    ? [currentNode.transitions[0].transition]
    : [];
}

/**
 * Determine the nextNode in a conditional transition node
 * @param patientData - JSON object representing the data on a patient
 * @param currentNode - the current node
 * @param currentNodeKey - the name of the current node
 * @return the next node
 */
function getConditionalNextNode(
  patientData: PatientData,
  currentNode: PathwayNode,
  currentNodeKey: string,
  resources: DomainResource[]
): NodeData | null {
  const documentation: DocumentationResource[] = [];
  const nextNodes: string[] = [];
  for (const transition of currentNode.transitions) {
    if (transition.condition) {
      let currentTransitionDocumentation: DocumentationResource | null = null;
      if (patientData[transition.condition.description] === true) {
        // TODO: how should this actually work now? this is a dummy object
        const r = resources[0]; // probably the patient object tbh
        currentTransitionDocumentation = {
          resourceType: r.resourceType || 'Patient',
          id: r.id || '1',
          status: 'completed',
          node: currentNode.key,
          onPath: true
        };
      } else {
        const documentReference = retrieveNote(transition.condition.description, resources);
        if (documentReference) {
          currentTransitionDocumentation = {
            resourceType: 'DocumentReference',
            id: documentReference.id ? documentReference.id : 'unknown',
            status: documentReference.status,
            node: currentNodeKey,
            resource: documentReference,
            onPath: true
          };
        }
      }

      if (currentTransitionDocumentation) {
        nextNodes.push(transition.transition);
        documentation.push(currentTransitionDocumentation);
      }
    }
  }

  if (nextNodes.length && documentation.length)
    return {
      nextNodes: nextNodes,
      documentation: formatDocumentation(documentation[0], currentNodeKey),
      status: documentation[0].status
    };
  else return null;
}

/**
 * Helper function to traverse the pathway and determine the next node in a patients pathway.
 * For actions this function will also verify the move is valid by the resource status
 * @param pathway - JSON object representing the complete pathway
 * @param patientData - JSON object representing the data on a patient
 * @param currentNodeKey - the name of the current node in the traversal
 * @return returns object with the next node, the status, and the evidenvce
 */
function nextNode(
  pathway: Pathway,
  patientData: PatientData,
  currentNodeKey: string,
  resources: DomainResource[]
): NodeData | null {
  const currentNode: PathwayNode | ActionNode = pathway.nodes[currentNodeKey];
  if (currentNode.type === 'action') {
    let resource = patientData[currentNodeKey];
    if (resource?.length) {
      resource = resource[0]; // TODO: add functionality for multiple resources
      return {
        nextNodes: formatNextNode(resource, currentNode, resources),
        documentation: formatDocumentation(resource, currentNodeKey),
        status: 'status' in resource ? resource.status : 'unknown'
      };
    } else {
      // Check for note posted on decline
      const documentReference = retrieveNote(currentNode.label, resources);
      if (documentReference) {
        const doc = {
          resourceType: 'DocumentReference',
          id: documentReference.id ? documentReference.id : 'unknown',
          status: 'status' in documentReference ? documentReference.status : 'unknown',
          node: currentNodeKey,
          resource: documentReference,
          onPath: true
        };
        return {
          nextNodes: formatNextNode(doc, currentNode, resources),
          documentation: formatDocumentation(doc, currentNodeKey),
          status: doc.status
        };
      }
      // Action exists but has no matching resource in patientData
      return null;
    }
  } else if (currentNode.transitions.length === 1) {
    return {
      nextNodes: [currentNode.transitions[0].transition],
      documentation: { node: currentNodeKey, onPath: true },
      status: 'completed'
    };
  } else if (currentNode.transitions.length > 1) {
    return getConditionalNextNode(patientData, currentNode, currentNodeKey, resources);
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
