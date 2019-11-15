// External CQL -> ELM service
// const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

import config from '../utils/ConfigManager';

const url = config.get('cqlToElmWebserviceUrl');

/**
 * Function that requests web_service to convert the cql into elm.
 * @param {string} cql - cql file that is the input to the function.
 * @return {string} The resulting elm translation of the cql file.
 */
export const convertCQL = function(cql) {
  // Connect to web service

  const request = new XMLHttpRequest();

  request.open('POST', url, false); // `false` makes the request synchronous
  request.setRequestHeader('Content-Type', 'application/cql');
  request.setRequestHeader('Accept', 'application/elm+json');
  request.send(cql);
  return request.responseText;
};
