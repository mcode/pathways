declare module 'pathways-model' {
  import { DomainResource, MedicationRequest, ServiceRequest } from 'fhir-objects';
  export interface Pathway {
    name: string;
    description?: string;
    library: string;
    preconditions: Precondition[];
    nodes: {
      [key: string]: ActionNode | BranchNode | PathwayNode;
    };
    elm?: PathwayELM;
    // TODO: this should not be optional once we have the pathway builder
  }

  export interface PathwayELM {
    navigational?: object;
    preconditions?: object;
  }

  export interface EvaluatedPathway {
    pathway: Pathway;
    pathwayResults: PathwayResults | null;
  }

  export interface Precondition {
    elementName: string; // name of the mCODE element
    expected: string; // human readable value
    cql: string; // cql to fetch the value from a patient
  }

  export interface PathwayNode {
    label: string;
    transitions: Transition[];
  }

  export interface ActionNode extends PathwayNode {
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
    resource: MedicationRequest | ServiceRequest;
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
    currentNodes: string[];
    documentation: {
      [key: string]: Documentation;
    };
  }

  export interface PreconditionResultItem {
    // doesn't extend Precondition because we don't care about the cql here,
    // and don't want to make it optional in Precondition

    elementName: string; // name of the mCODE element
    expected: string; // human readable value
    actual: string;
    match: boolean; // in case expected !== actual but they are still a match
  }

  export interface PreconditionResult {
    pathwayName: string;
    matches: number;
    preconditionResultItems: PreconditionResultItem[];
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
    [key: string]: Array<DomainResource, string> | DomainResource;
  }

  export interface Documentation {
    node: string;
    onPath: boolean;
  }

  export interface DocumentationResource extends Documentation {
    resourceType: string;
    id: string;
    status: string;
    resource?: DomainResource;
  }

  export interface PathwayContextInterface {
    evaluatedPathway: EvaluatedPathway | null;
    setEvaluatedPathway: (
      evaluatedPathway: EvaluatedPathway | null,
      selectPathway?: boolean
    ) => void;
    updateEvaluatedPathways: (value: EvaluatedPathway) => void;
    assignPathway: (pathwayName: string) => void;
    unassignPathway: (pathwayName: string) => void;
  }
}
