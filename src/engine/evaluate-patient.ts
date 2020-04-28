import { extractNavigationCQL, extractCriteriaCQL, CqlObject, Library } from './cql-extractor';
import convertCQL, { convertBasicCQL, ElmObject } from './cql-to-elm';
import executeElm from './elm-executor';
import { pathwayData, criteriaData } from './output-results';
import { Pathway, PatientData, PathwayResults, ElmResults, CriteriaResult } from 'pathways-model';
import { getFixture } from './cql-extractor';
import { extractCQLInclude } from 'utils/regexes';
import { DomainResource, Bundle } from 'fhir-objects';
function instanceOfElmObject(object: object): object is ElmObject {
  return 'main' in object;
}

/**
 * Function to run each of the engine files in series to execute
 * the automated pathway
 * @param patientRecord - Patient's record as FHIR data
 * @param pathway - entire Pathway object
 * @return Information on the patient's current status within the
 *                  clinical pathway
 */
export function evaluatePatientOnPathway(
  patientRecord: Bundle,
  pathway: Pathway,
  resources: DomainResource[]
): Promise<PathwayResults> {
  const patientDataPromise = pathway.elm?.navigational
    ? processELMCommon(patientRecord, pathway.elm.navigational)
    : extractNavigationCQL(pathway).then(cql => processCQLCommon(patientRecord, cql));

  return patientDataPromise.then(patientData => pathwayData(pathway, patientData, resources));
}

/**
 * Evaluate the pathway criteria against the given patient.
 * @param patientRecord - Patient's record as FHIR data
 * @param pathway - entire Pathway object
 * @return a list of CriteriaResults, each containing
 *         the expected value and actual value for one criteria item
 */
export function evaluatePathwayCriteria(
  patientRecord: Bundle,
  pathway: Pathway
): Promise<CriteriaResult> {
  const patientDataPromise = pathway.elm?.criteria
    ? processELMCommon(patientRecord, pathway.elm.criteria)
    : extractCriteriaCQL(pathway).then(cql => processCQLCommon(patientRecord, cql));

  return patientDataPromise.then(patientData => criteriaData(pathway, patientData));
}

/**
 * Common logic to execute the given CQL against the given Patient.
 * @param patientRecord - Patient's record as FHIR data
 * @param cql - aggregated CQL from a pathway
 * @return the raw, unprocessed patientResults
 *         derived from executing the CQL against the given patient
 */
function processCQLCommon(patientRecord: Bundle, cql: string): Promise<PatientData> {
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
    .then(elm => processELMCommon(patientRecord, elm));
}

/**
 * Common logic to execute the given ELM against the given Patient.
 * @param patientRecord - Patient's record as FHIR data
 * @param elm - resulting ELM from converting the CQL in a pathway
 * @return the raw, unprocessed patientResults
 *         derived from executing the ELM against the given patient
 */
function processELMCommon(patientRecord: Bundle, elm: object): Promise<PatientData> {
  // this is not inherently async,
  // but we wrap it in a promise to make the code cleaner elsewhere
  return new Promise((resolve, reject) => {
    let elmResults: ElmResults;
    if (instanceOfElmObject(elm)) {
      elmResults = executeElm(patientRecord, elm.main, elm.libraries);
    } else {
      elmResults = executeElm(patientRecord, elm);
    }

    // TODO - update pathwaysData to take multiple patients
    const patientIds = Object.keys(elmResults.patientResults);
    const patientData = elmResults.patientResults[patientIds[0]];
    resolve(patientData);
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
