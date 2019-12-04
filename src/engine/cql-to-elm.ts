// External CQL -> ELM service

import config from 'utils/ConfigManager';

const url = config.get('cqlToElmWebserviceUrl');

/**
 * Function that requests web_service to convert the cql into elm.
 * @param cql - cql file that is the input to the function.
 * @return The resulting elm translation of the cql file.
 */
export default function convertCQL(cql: string): Promise<object> {
  // Connect to web service

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/cql',
      Accept: 'application/elm+json'
    },
    body: cql
  }).then(elm => elm.json());
}
