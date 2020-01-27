import { extractNavigationCQL, extractCriteriaCQL, CqlObject, Library } from './cql-extractor';
import convertCQL, { convertBasicCQL, ElmObject } from './cql-to-elm';
import executeElm from './elm-executor';
import { pathwayData, criteriaData } from './output-results';
import { Pathway, PatientData, PathwayResults, ElmResults, CriteriaResult } from 'pathways-model';
import { getFixture } from './cql-extractor';
import { extractCQLInclude } from 'utils/regexes';

function instanceOfElmObject(object: object): object is ElmObject {
  return 'main' in object;
}

/**
 * Function to run each of the engine files in series to execute
 * the automated pathway
 * @param patient - Patient's record as FHIR data
 * @param pathway - entire Pathway object
 * @return Information on the patient's current status within the
 *                  clinical pathway
 */
export function evaluatePatientOnPathway(
  patient: object,
  pathway: Pathway,
  resources: object[]
): Promise<PathwayResults> {
  return extractNavigationCQL(pathway)
    .then(cql => processCQLCommon(patient, cql))
    .then(patientData => pathwayData(pathway, patientData, resources));
}

/**
 * Evaluate the pathway criteria against the given patient.
 * @param patient - Patient's record as FHIR data
 * @param pathway - entire Pathway object
 * @return a list of CriteriaResults, each containing
 *         the expected value and actual value for one criteria item
 */
export function evaluatePathwayCriteria(
  patient: object,
  pathway: Pathway
): Promise<CriteriaResult[]> {
  return extractCriteriaCQL(pathway)
    .then(cql => processCQLCommon(patient, cql))
    .then(patientData => criteriaData(pathway, patientData));
}

/**
 * Common logic to execute the given CQL against the given Patient.
 * @param patient - Patient's record as FHIR data
 * @param pathway - entire Pathway object
 * @return the raw, unprocessed patientResults
 *         derived from executing the CQL against the given patient
 */
function processCQLCommon(patient: object, cql: string): Promise<PatientData> {
  // Likely need an intermediary step that gathers the CQL files needed
  // example function gatherCQL
  return gatherCQL(cql)
    .then(result => {
      if (Object.keys(result).length > 0) {
        // non-empty library
        const cqlObject: CqlObject = {
          main: cql,
          libraries: result
        };
        return convertCQL(cqlObject);
      } else {
        return convertBasicCQL(cql);
      }
    })
    .then(elm => {
      let elmResults: ElmResults = {
        patientResults: {}
      };
      if (instanceOfElmObject(elm)) {
        elmResults = executeElm(patient, elm.main, elm.libraries);
      } else {
        elmResults = executeElm(patient, elm);
      }

      // TODO - update pathwaysData to take multiple patients
      const patientIds = Object.keys(elmResults.patientResults);
      const patientData = elmResults.patientResults[patientIds[0]];
      return patientData;
    });
}

// example function that would gather library CQL files
function gatherCQL(cql: string): Promise<Library> {
  const lib = extractCQLInclude.exec(cql);
  if (lib) {
    return getFixture(`${lib[1]}.cql`).then(result => {
      return new Promise(function(resolve, reject): void {
        setTimeout(function() {
          resolve({ FHIRHelpers: result });
        }, 300);
      });
    });
  } else {
    return new Promise(function(resolve, reject): void {
      resolve({});
    });
  }
}
