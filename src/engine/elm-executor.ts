/* eslint-disable max-len */
import { ElmResults } from 'pathways-model';
import { Library, Executor, Repository } from 'cql-execution';
import { PatientSource } from 'cql-exec-fhir';
import { Bundle } from 'fhir-objects';
/**
 * Engine function that takes in a patient file (JSON) and an ELM file, running the patient against the ELM file
 * @param patientRecord - FHIR bundle containing patient's record
 * @param elm - ELM structure (previosuly converted from CQL) on which the patient will be run.
 * @return returns a JSON object which is the result of analyzing the patient against the elm file
 */
export default function executeElm(
  patientRecord: Bundle,
  elm: object,
  libraries?: object
): ElmResults {
  let lib;
  if (libraries) {
    lib = new Library(elm, new Repository(libraries));
  } else {
    lib = new Library(elm);
  }

  const executor = new Executor(lib);
  const psource = new PatientSource.FHIRv401(patientRecord);
  psource.loadBundles(patientRecord);
  const result = executor.exec(psource);
  return result;
}
