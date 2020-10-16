declare module 'pathways-model' {
  import { ElmLibrary } from 'elm-model';
  import { DomainResource, MedicationRequest, ServiceRequest, CarePlan } from 'fhir-objects';

  export type NodeObj = { [key: string]: ActionNode | BranchNode | ReferenceNode | PathwayNode };

  export interface Pathway {
    name: string;
    description?: string;
    library: string;
    preconditions: Precondition[];
    nodes: NodeObj;
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
    id: string;
    elementName: string; // name of the mCODE element
    expected: string; // human readable value
    cql: string; // cql to fetch the value from a patient
  }

  export interface PathwayNode {
    key: string;
    label: string;
    transitions: Transition[];
    type: 'action' | 'branch' | 'reference' | 'start' | 'null';
  }

  export interface ActionNode extends PathwayNode {
    cql: string;
    elm?: ElmLibrary;
    action: Action[];
  }

  export interface BranchNode extends PathwayNode {
    mcodeCriteria?: string;
    otherCriteria?: string;
  }

  export interface ReferenceNode extends PathwayNode {
    referenceId: string;
    referenceLabel: string;
  }

  interface Action {
    id: string;
    type: string;
    description: string;
    resource: MedicationRequest | ServiceRequest | CarePlan;
  }

  export interface Transition {
    id: string;
    transition: string;
    condition?: {
      description: string;
      cql: string;
      elm?: ElmLibrary;
      criteriaSource?: string;
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
