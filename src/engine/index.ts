import { extractor } from './cql_extractor';
import { convertCQL } from './cql_to_elm';
import { executeElm } from './elm-executor';
import { pathwayData } from './output-results';
import { Pathway, PathwayResults } from 'pathways-model';

/**
 * Function to run each of the engine files in series to execute
 * the automated pathway
 * @param pathway - block of CQL code from the pathway
 * @param patient - JSON representing the patient's EHR
 * @return Information on the patient's current status within the
 *                  clinical pathway
 */
export const pathways = function(pathway: Pathway, patient: (object | string)): PathwayResults {
  const cql = extractor(pathway);
  const elm = convertCQL(cql.toString());
  const elmResults = executeElm(patient, elm);

  // TODO - update pathwaysData to take multiple patients
  const patientIds = Object.keys(elmResults.patientResults);
  const patientData = elmResults.patientResults[patientIds[0]];

  return pathwayData(pathway, patientData);
};
