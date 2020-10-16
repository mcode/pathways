import { extractNavigationCQL, extractPreconditionCQL, CqlObject } from './cql-extractor';
import convertCQL, { convertBasicCQL, ElmObject } from './cql-to-elm';
import executeElm from './elm-executor';
import { pathwayData, preconditionData } from './output-results';
import {
  Pathway,
  PatientData,
  PathwayResults,
  ElmResults,
  PreconditionResult
} from 'pathways-model';
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
 * Evaluate the pathway preconditions against the given patient.
 * @param patientRecord - Patient's record as FHIR data
 * @param pathway - entire Pathway object
 * @return a list of PreconditionResults, each containing
 *         the expected value and actual value for one precondition item
 */
export function evaluatePathwayPreconditions(
  patientRecord: Bundle,
  pathway: Pathway
): Promise<PreconditionResult> {
  const patientDataPromise = pathway.elm?.preconditions
    ? processELMCommon(patientRecord, pathway.elm.preconditions)
    : extractPreconditionCQL(pathway).then(cql => processCQLCommon(patientRecord, cql));

  return patientDataPromise.then(patientData => preconditionData(pathway, patientData));
}

/**
 * Common logic to execute the given CQL against the given Patient.
 * @param patientRecord - Patient's record as FHIR data
 * @param cql - aggregated CQL from a pathway
 * @return the raw, unprocessed patientResults
 *         derived from executing the CQL against the given patient
 */
function processCQLCommon(patientRecord: Bundle, cql: CqlObject): Promise<PatientData> {
  const elmPromise =
    Object.keys(cql.libraries).length > 0 ? convertCQL(cql) : convertBasicCQL(cql.main);

  return elmPromise.then(elm => processELMCommon(patientRecord, elm));
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
