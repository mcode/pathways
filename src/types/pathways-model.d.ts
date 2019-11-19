declare module 'pathways-model' {
  export interface Pathway {
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
    resource: object; // TODO: FHIR resources
  }

  // export interface BranchState extends State {
  //   // nothing special, yet
  // }

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
    nextRecommendation: any;
    documentation: Array<any>;
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
}
