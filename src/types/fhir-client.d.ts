declare module 'pathways-client' {
  import { Resource } from 'fhir-objects';
  export interface PathwaysClient {
    state?: Record<string, Record<string>>;
    environment?: Record<string, null, Record<string, boolean, Record<string>>>;
    patient: Record<string, Function>;
    encounter?: Record<string, Function>;
    user?: Record<string, Function>;
    units?: Record<string, Function>;
    create?: (resource: Resource) => Promise<Resource>;
    delete?: (uri: string) => Promise<Resource>;
  }
}
