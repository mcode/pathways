const extractor = require('./cql_extractor');
const convertor = require('./cql_to_elm');
const executor = require('./elm_executor');
const locator = require('./output_results');

/**
 * Function to run each of the engine files in series to execute
 * the automated pathway
 * @param {object} pathway - block of CQL code from the pathway
 * @param {object} patient - JSON representing the patient's EHR
 * @return {object} Information on the patient's current status within the
 *                  clinical pathway
 */
exports.pathways = function(pathway, patient) {
  const cql = extractor.extractor(pathway);
  const elm = convertor.convertCQL(cql.toString());
  let patientData = executor.executeElm(patient, elm);

  // TODO - update pathwaysData to take multiple patients
  const patientIds = Object.keys(patientData.patientResults);
  patientData = patientData.patientResults[patientIds[0]];
  const pathwayData = locator.pathwayData(pathway, patientData);

  return pathwayData;
};
