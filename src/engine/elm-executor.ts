/* eslint-disable max-len */
import { LooseObject } from './cql-to-elm';
import { ElmResults } from 'pathways-model';
import { Library, Executor } from 'cql-execution';
import { PatientSource } from 'cql-exec-fhir';

/**
 * Engine function that takes in a patient file (JSON) and an ELM file, running the patient against the ELM file
 * @param patient - FHIR bundle containing patient's record
 * @param elm - ELM structure (previosuly converted from CQL) on which the patient will be run.
 * @return returns a JSON object which is the result of analyzing the patient against the elm file
 */
export default function executeElm(patient: object, elm: LooseObject): ElmResults {
  const lib = new Library(elm.main);
  const executor = new Executor(lib);
  const psource = new PatientSource.FHIRv400(patient);
  psource.loadBundles(patient);
  const result = executor.exec(psource);
  console.log(result);
  return result;
}
