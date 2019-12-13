import extractCQL, {CqlObject, Library} from './cql-extractor';
import convertCQL from './cql-to-elm';
import executeElm from './elm-executor';
import pathwayData from './output-results';
import { Pathway, PathwayResults } from 'pathways-model';

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
  return extractCQL(pathway)
    // Likely need an intermediary step that gathers the CQL files needed
    .then((cql: CqlObject) => {
        // example function gatherCQL 
        return gatherCQL().then((result)=>{
            Object.keys(result).forEach((key)=>{
                cql.libraries[key] = result[key];
            })
            return convertCQL(cql)
        })

    })
    .then(elm => {
        console.log(elm);
      const elmResults = executeElm(patient, elm);

      // TODO - update pathwaysData to take multiple patients
      const patientIds = Object.keys(elmResults.patientResults);
      const patientData = elmResults.patientResults[patientIds[0]];

      return pathwayData(pathway, patientData);
    });
};

// example function that would gather library CQL files
function gatherCQL(): Promise<Library>{
    const result = {'name1':'library exampleOne version \'1\'\n\nusing FHIR version \'4.0.0\'\n\n// CODESYSTEMS\ncodesystem "SNOMEDCT": \'http://snomed.info/sct\'\n\ncontext Patient\n\n// mCODE Profile Statements\ndefine "Patient":\n    [Patient]\n', 'name2':'library exampleTwo version \'1\'\n\nusing FHIR version \'4.0.0\'\n\n// CODESYSTEMS\ncodesystem "SNOMEDCT": \'http://snomed.info/sct\'\n\ncontext Patient\n\n// mCODE Profile Statements\ndefine "Patient":\n    [Patient]\n'};
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve(result);
        }, 300);
      });
}
