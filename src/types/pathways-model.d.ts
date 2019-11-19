declare module 'pathways-model' {
  export interface Pathway {
    states: {
      [key: string]: State;
    };
  }

  export interface State {
    label: string;
    transitions: Array<Transition>;
  }

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

  export interface PatientData {
    Patient: {
      id: {
        value: string;
      }
    };
    [key: string]: any;
  }
}
