/* eslint-disable guard-for-in */
/* eslint-disable max-len */
/**
 * Engine function to take in the ELM patient results and output data relating to the patient's pathway
 * @param pathway - JSON (or string representing) the entire pathway
 * @param {string} patientData - JSON (or string representing) the data on the patient from a CQL execution. Note this is a single patient not the entire patientResults object
 * @return {object} returns a JSON object describing where the patient is on the given pathway
 *  {
 *    currentState - the name of the state patient is currently in
 *    currentStatus - the status of the patient in the current state (from FHIR resource)
 *          A status of unknown could be the resource returned an unknown status or the resource has no status at all
 *    path - list of the names of states in the patient's pathway
 *    documentation - list of documentation for the trace of the pathway (documentation is corresponding resource)
 *  }
 */
export const pathwayData = function(pathway, patientData) {
  if (typeof pathway === 'string') pathway = JSON.parse(pathway);
  if (typeof patientData === 'string') patientData = JSON.parse(patientData);

  const patientPathInfo = getPatientPath(pathway, patientData);
  return patientPathInfo;
};

/**
 * Helper function to determine the pathway followed by a patient and provide the documentation for the pathway
 * @param {object} pathway - JSON object representing the complete pathway
 * @param {object} patientData - JSON object representing the data on a patient
 * @return {object} returns object with the current state, pathway as a list of states, and documentation for pathway as a list of conditions
 */
function getPatientPath(pathway, patientData) {
  let stateData = {currentState: 'Start'}; // Start at the "start" node
  let currentStatus;
  const patientdocumentation = [];
  const patientPathway = [stateData.currentState];

  stateData = nextState(pathway, patientData, stateData.currentState);
  while (stateData !== null) {
    currentStatus = stateData.status;
    if (stateData.documentation !== null) patientdocumentation.push(stateData.documentation);
    if (stateData.nextState === null) break; // The position of this line is important to maintain consistency for different scenarios
    patientPathway.push(stateData.nextState);
    stateData = nextState(pathway, patientData, stateData.nextState);
  }
  const currentStateName = patientPathway[patientPathway.length - 1];
  const currentState = pathway.states[currentStateName];
  return {
    patientId: patientData.Patient.id.value,
    currentState: currentStateName,
    currentStatus: currentStatus,
    nextRecommendation: nextStateRecommendation(currentState),
    path: patientPathway,
    documentation: patientdocumentation,
  };
}

/**
 * Helper function to set the next recommendation
 * @param {object} state - the current state in the pathway (where the patient is)
 * @return {object} "pathway terminal" if state is the end of the pathway
 *        the name of the next state in a direct transition
 *        an object describing possible transitions and descriptions
 */
function nextStateRecommendation(state) {
  const transitions = state.transitions;
  if (transitions.length === 0) return 'pathway terminal';
  else if (transitions.length === 1) return transitions[0].transition;
  else {
    return transitions.map((transition) => {
      return {
        state: transition.transition,
        conditionDescription: transition.condition.description,
      };
    });
  }
}

/**
 * Helper function to format the documentation and include the related state
 * @param {object} resource - the resource returned by the CQL execution
 * @param {string} state - the current state name
 * @return {object} the JSON resource with the state property set
 */
function formatdocumentation(resource, state) {
  resource.state = state;
  return resource;
}

/**
 * Helper function to select the transition state
 * This function is needed because MedicationRequests can have multiple
 * different statuses to indiciate complete
 * @param {object} resource - the resource returned by the CQL execution
 * @param {object} currentState - the current state
 * @return {String} the next state name or null
 */
function formatNextState(resource, currentState) {
  if (resource.resourceType === 'MedicationRequest') {
    return currentState.transitions.length !== 0
      ? currentState.transitions[0].transition
      : null;
  } else {
    return resource.status === 'completed' &&
      currentState.transitions.length !== 0
      ? currentState.transitions[0].transition
      : null;
  }
}

/**
 * Determine the nextState in a conditional transition state
 * @param {object} patientData - JSON object representing the data on a patient
 * @param {object} currentState - the current state
 * @param {string} currentStateName - the name of the current state
 * @return {object} the next state
 */
function getConditionalNextState(patientData, currentState, currentStateName) {
  for (const x in currentState.transitions) {
    const transition = currentState.transitions[x];
    let documentationResource = patientData[transition.condition.description];
    if (documentationResource.length) {
      documentationResource = documentationResource[0]; // TODO: add functionality for multiple resources
      return {
        nextState: transition.transition,
        documentation: formatdocumentation(documentationResource, currentStateName),
        status: documentationResource.hasOwnProperty('status')
                  ? documentationResource.status
                  : 'unkown',
      };
      // Is there ever a time we may hit multiple conditions?
    }
  }


  // No matching resource in the patient data to move from state
  return noMatchingResourceForState();
}

/**
 * No resource exists for the next state
 * @return {object} empty object
 */
function noMatchingResourceForState() {
  return {
    nextState: null,
    documentation: null,
    status: 'not-done',
  };
}

/**
 * Helper function to traverse the pathway and determine the next state in a patients pathway.
 * For actions this function will also verify the move is valid by the resource status
 * @param {object} pathway - JSON object representing the complete pathway
 * @param {object} patientData - JSON object representing the data on a patient
 * @param {string} currentStateName - the name of the current state in the traversal
 * @return {object} returns object with the next state, the status, and the evidenvce
 */
function nextState(pathway, patientData, currentStateName) {
  const currentState = pathway.states[currentStateName];
  if (currentState.hasOwnProperty('action')) {
    let resource = patientData[currentStateName];
    if (resource.length) {
      resource = resource[0]; // TODO: add functionality for multiple resources
      return {
        nextState: formatNextState(resource, currentState),
        documentation: formatdocumentation(resource, currentStateName),
        status: resource.hasOwnProperty('status') ? resource.status : 'unkown',
      };
    } else {
      // Action exists but has no matching resource in patientData
      return noMatchingResourceForState();
    }
  } else if (currentState.transitions.length === 1) {
    return {
      nextState: currentState.transitions[0].transition,
      documentation: 'direct',
      status: 'completed',
    };
  } else if (currentState.transitions.length > 1) {
    return getConditionalNextState(patientData, currentState, currentStateName);
  } else return null;
}
