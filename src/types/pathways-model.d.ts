declare module 'pathways-model' {
  export interface Pathway {
    name: string;
    description?: string;
    library: string;
    states: {
      [key: string]: GuidanceState | BranchState;
    };
  }

  export interface State {
    label: string;
    transitions: Array<Transition>;
  }

  export interface GuidanceState extends State {
    cql: string;
    action: Array<Action>;
  }

  interface Action {
    type: string;
    description: string;
    resource: BasicActionResource | BasicMedictionRequestResource; // TODO: FHIR resources
  }

  interface BasicResource {
    resourceType: string;
  }

  interface BasicMedictionRequestResource extends BasicResource {
    medicationCodeableConcept: Coding;
  }

  interface BasicActionResource extends BasicResource {
    code: Coding;
  }

  interface Coding {
    coding: Array<Code>;
    text?: string;
  }

  interface Code {
    code: string;
    system: string;
    display: string;
  }

  // NOTE: the model also includes a BranchState (which extends State),
  // but as of right now it has no additional fields not in State,
  // and TypeScript does not allow "empty" interfaces so we can't add it yet.
  // Add it here if/when we ever need it.

  interface Transition {
    transition: string;
    condition?: {
      description: string;
      cql: string;
    };
  }

  export interface PathwayResults {
    patientId: string;
    currentState: string;
    currentStatus: string | undefined;
    nextRecommendation: string | object;
    documentation: Array<DocumentationResource | string>;
    path: Array<string>;
  }

  export interface ElmResults {
    patientResults: {
      [key: string]: PatientData;
    };
  }

  export interface PatientData {
    Patient: {
      id: {
        value: string;
      };
    };
    [key: string]: any;
  }

  export interface DocumentationResource {
    resourceType: string;
    id: string;
    status: string;
    state: string;
  }
}
