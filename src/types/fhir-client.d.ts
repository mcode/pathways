declare module 'pathways-client' {
  export interface PathwaysClient {
    state?: Record<string, Record<string>>;
    environment?: Record<string, null, Record<string, boolean, Record<string>>>;
    patient: Record<string, Function>;
    encounter?: Record<string, Function>;
    user?: Record<string, Function>;
    units?: Record<string, Function>;
    create?: (resource: fhir.Resource) => Promise<fhir.Resource>;
  }
}
