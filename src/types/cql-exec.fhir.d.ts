declare module 'cql-exec-fhir' {
  import { Bundle } from 'fhir-objects';
  export const PatientSource = {
    FHIRv401: class {
      constructor(patient: Bundle);
      loadBundles(bundle: Bundle): void;
    }
  };
}
