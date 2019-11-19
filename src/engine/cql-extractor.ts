import { Pathway, State } from 'pathways-model';

const getFixture = (filename: string) => fetch(`./static/cql/${filename}`).then(cql => cql.text());

/**
 * Function to format each block from the pathway in CQL format
 * @param {String} cqlBlock - block of CQL code from the pathway
 * @param {String} resourceName - Name of the CQL resource block to be defined
 * @return {string} the CQL code formatted pretty with the define line
 */
function cqlFormat(cqlBlock: string, resourceName: string): string {
  let formattedBlock = '';

  // Definition of CQL block
  const line1 = 'define "' + resourceName + '":\n\t';

  // Build the formatted block
  formattedBlock = line1.concat(cqlBlock);
  return formattedBlock;
}

/**
 * Helper function to add the cql block to the completed cql
 * with the correct formatting
 * @param {string} cql - complete cql string
 * @param {string} cqlBlock - current cql block to append to the cql
 * @return {string} the cql with the cql block appended correctly
 */
function cqlAdd(cql: string, cqlBlock: string) {
  return cql.concat('\n', '\n', cqlBlock);
}

/**
 * Helper function to determine if a state has a conditional transition
 * @param {State} state - the JSON object of the desired state on the pathway
 * @return {boolean} true if state is a conditional transition and false
 *                   otherwise
 */
function isConditional(state: State): boolean {
  if (state.hasOwnProperty('transitions')) {
    return state.transitions.length > 1 ? true : false;
  } else return false;
}

/**
 * Function to extract the CQL code from each state in the pathway and build
 * the CQL code to execute
 * @param {Pathway} pathway - the JSON object of the entire pathway
 * @return {string} a string of the CQL code for the pathway
 */
export const extractCQL = function(pathway: Pathway) : Promise<string> {
  return getFixture(pathway.library).then(library => {
    let cql = library;
    // Loop through each JSON object in the pathway
    for (const stateName in pathway.states) {
      const state = pathway.states[stateName];
      if ('cql' in state) {
        const cqlBlock1 = state.cql;
        const nextBlock1 = cqlFormat(cqlBlock1, stateName);
        cql = cqlAdd(cql, nextBlock1);
      } else if (isConditional(state)) {
        for (const obj in state.transitions) {
          const condition = state.transitions[obj].condition;
          if (condition) {
            const nextBlock2 = cqlFormat(condition.cql, condition.description);
            cql = cqlAdd(cql, nextBlock2);
          }
        }
      }
    }

    return cql;
  });
};
