declare module 'cql-exec-fhir' {
  export const PatientSource = {
    FHIRv400: class {
      constructor(patient: object); // TODO: FHIR type
      loadBundles(bundle: object): void; // FHIR type here too
    }
  };
}
