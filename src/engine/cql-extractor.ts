import { Pathway, State } from 'pathways-model';

export interface CqlObject{
    main: string,
    libraries: {
        [name: string]: string
    }
}

export interface Library{
    [name: string]: string // should probably have an object for expected ELM structure.
}
function getFixture(filename: string): Promise<string> {
  return fetch(`./static/cql/${filename}`).then(cql => cql.text());
}

/**
 * Function to format each block from the pathway in CQL format
 * @param cqlBlock - block of CQL code from the pathway
 * @param resourceName - Name of the CQL resource block to be defined
 * @return the CQL code formatted pretty with the define line
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
 * @param cql - complete cql string
 * @param cqlBlock - current cql block to append to the cql
 * @return the cql with the cql block appended correctly
 */
function cqlAdd(cql: string, cqlBlock: string): string {
  return cql.concat('\n', '\n', cqlBlock);
}

/**
 * Helper function to determine if a state has a conditional transition
 * @param state - the JSON object of the desired state on the pathway
 * @return true if state is a conditional transition and false
 *                   otherwise
 */
function isConditional(state: State): boolean {
  if ('transitions' in state) {
    return state.transitions.length > 1 ? true : false;
  } else return false;
}

/**
 * Function to extract the CQL code from each state in the pathway and build
 * the CQL code to execute
 * @param pathway - the JSON object of the entire pathway
 * @return a string of the CQL code for the pathway
 */
export default function extractCQL(pathway: Pathway): Promise<CqlObject> {
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

    // example inclusion of extra cql file
    return getFixture("mCODE.cql").then(library => {
        return {
            main: cql, 
            libraries: {"mCODE.cql":library}};
    });

  });
}
