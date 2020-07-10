import { Pathway, PathwayNode } from 'pathways-model';

export interface CqlObject {
  main: string;
  libraries: Library;
}

export interface Library {
  [name: string]: string; // should probably have an object for expected ELM structure.
}
export function getFixture(filename: string): Promise<string> {
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
 * Helper function to determine if a node has a conditional transition
 * @param node - the JSON object of the desired node on the pathway
 * @return true if node is a conditional transition and false
 *                   otherwise
 */
function isConditional(node: PathwayNode): boolean {
  if ('transitions' in node) {
    return node.transitions.length > 1 ? true : false;
  } else return false;
}

/**
 * Function to extract the CQL code from each node in the pathway and build
 * the CQL code to execute
 * @param pathway - the JSON object of the entire pathway
 * @return a string of the CQL code for the navigational nodes in the pathway
 */
export function extractNavigationCQL(pathway: Pathway): Promise<string> {
  return getFixture(pathway.library).then(library => {
    let cql = library;
    // Loop through each JSON object in the pathway
    for (const nodeKey in pathway.nodes) {
      const node = pathway.nodes[nodeKey];
      if ('cql' in node) {
        const cqlBlock1 = node.cql;
        const nextBlock1 = cqlFormat(cqlBlock1, nodeKey);
        cql = cqlAdd(cql, nextBlock1);
      } else if (isConditional(node)) {
        for (const transition of node.transitions) {
          const condition = transition.condition;
          if (condition) {
            const nextBlock2 = cqlFormat(condition.cql, condition.description);
            cql = cqlAdd(cql, nextBlock2);
          }
        }
      }
    }

    return cql;
  });
}

/**
 * Extract the CQL statements from the `preconditions` section of the pathway
 * into a snippet ready to be converted to ELM.
 * @param pathway - the entire pathway object
 * @return a string of the CQL for the preconditions in the pathway
 */
export function extractPreconditionCQL(pathway: Pathway): Promise<string> {
  return getFixture(pathway.library).then(library => {
    let cql = library;
    // Loop through each JSON object in the pathway
    for (const precondition of pathway.preconditions) {
      const cqlBlock1 = precondition.cql;
      const nextBlock1 = cqlFormat(cqlBlock1, precondition.elementName);
      cql = cqlAdd(cql, nextBlock1);
    }

    return cql;
  });
}
