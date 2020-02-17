declare module 'pathways-model' {
  export interface Pathway {
    name: string;
    description?: string;
    library: string;
    criteria: Criteria[];
    states: {
      [key: string]: State;
    };
  }

  export interface EvaluatedPathway {
    pathway: Pathway;
    pathwayResults: PathwayResults | null;
  }

  export interface Criteria {
    elementName: string; // name of the mCODE element
    expected: string; // human readable value
    cql: string; // cql to fetch the value from a patient
  }

  export interface State {
    label: string;
    transitions: Transition[];
  }

  export interface GuidanceState extends State {
    cql: string;
    action: Action[];
  }

  // NOTE: the model also includes a BranchState (which extends State),
  // but as of right now it has no additional fields not in State,
  // and TypeScript does not allow "empty" interfaces so we can't add it yet.
  // Add it here if/when we ever need it.

  interface Action {
    type: string;
    description: string;
    resource: BasicActionResource | BasicMedicationRequestResource; // TODO: FHIR resources
  }

  interface BasicResource {
    resourceType: string;
  }

  interface BasicMedicationRequestResource extends BasicResource {
    medicationCodeableConcept: Coding;
  }

  interface BasicActionResource extends BasicResource {
    code: Coding;
  }

  interface Coding {
    coding: Code[];
    text?: string;
  }

  interface Code {
    code: string;
    system: string;
    display: string;
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
    nextRecommendation: string | object;
    documentation: Array<DocumentationResource | string>;
    path: string[];
  }

  export interface CriteriaResult {
    // doesn't extend Criteria because we don't care about the cql here,
    // and don't want to make it optional in Criteria

    elementName: string; // name of the mCODE element
    expected: string; // human readable value
    actual: string;
    match: boolean; // in case expected !== actual but they are still a match
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
    [key: string]: Array<fhir.DomainResource, string> | fhir.DomainResource;
  }

  export interface DocumentationResource {
    resourceType: string;
    id: string;
    status: string;
    state: string;
    resource?: fhir.DomainResource;
  }

  export interface PathwayContextInterface {
    evaluatedPathway: EvaluatedPathway | null;
    setEvaluatedPathway: (
      evaluatedPathway: EvaluatedPathway | null,
      selectPathway?: boolean
    ) => void;
    updateEvaluatedPathways: (value: EvaluatedPathway) => void;
  }
}
