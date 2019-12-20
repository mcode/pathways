import extractCQL, { CqlObject, Library } from './cql-extractor';
import convertCQL, { convertBasicCQL, ElmObject } from './cql-to-elm';
import executeElm from './elm-executor';
import pathwayData from './output-results';
import { Pathway, PathwayResults, ElmResults } from 'pathways-model';
import { getFixture } from './cql-extractor';

function instanceOfElmObject(object: object): object is ElmObject {
  return 'main' in object;
}

/**
 * Function to run each of the engine files in series to execute
 * the automated pathway
 * @param pathway - block of CQL code from the pathway
 * @param patient - JSON representing the patient's EHR
 * @return Information on the patient's current status within the
 *                  clinical pathway
 */
export default function evaluatePatientOnPathway(
  patient: object,
  pathway: Pathway
): Promise<PathwayResults> {
  return (
    extractCQL(pathway)
      // Likely need an intermediary step that gathers the CQL files needed
      .then((cql: string) => {
        // example function gatherCQL
        return gatherCQL(cql).then(result => {
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
        });
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

        return pathwayData(pathway, patientData);
      })
  );
}

// example function that would gather library CQL files
function gatherCQL(cql: string): Promise<Library> {
  const lib = cql.match(/(?<=include .* called ).*(?=\n)/g);
  if (lib) {
    return getFixture(`${lib[0]}.cql`).then(result => {
      return new Promise(function(resolve, reject): void {
        setTimeout(function() {
          resolve({ FHIRHelpers: result });
        }, 300);
      });
    });
  } else {
    return new Promise(function(resolve, reject): void {
      setTimeout(function() {
        resolve({});
      }, 300);
    });
  }
}
