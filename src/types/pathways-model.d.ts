declare module 'pathways-model' {
  export interface Pathway {
    states: {
      [key: string]: State;
    };
  }

  interface State {
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
    path: Array<Object>;
  }
}
