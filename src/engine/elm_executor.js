/* eslint-disable max-len */
const cql = require('cql-execution');
const cqlfhir = require('cql-exec-fhir');

/**
 * Engine function that takes in a patient file (JSON) and an ELM file, running the patient against the ELM file
 * @param {string} patient - JSON string representing the patient's health record
 * @param {string} elm - ELM string representing the ELM (previosuly converted from CQL) on which the patient will be run.
 * @return {object} returns a JSON object which is the result of analyzing the patient against the elm file
 */
exports.executeElm = function(patient, elm) {
  if (typeof elm === 'string') {
    elm = JSON.parse(elm);
  }
  if (typeof patient === 'string') {
    patient = JSON.parse(patient);
  }

  const lib = new cql.Library(elm);
  const executor = new cql.Executor(lib);
  const psource = new cqlfhir.PatientSource.FHIRv400(patient);
  psource.loadBundles(patient);
  const result = executor.exec(psource);
  return result;
};
