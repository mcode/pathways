declare module 'mcode' {
  import { Condition, Observation } from 'fhir-objects';
  export interface McodeElements {
    primaryCancer?: string;
    laterality?: string;
    tumorCategory?: string;
    nodeCategory?: string;
    metastasesCategory?: string;
    estrogenReceptor?: string;
    progesteroneReceptor?: string;
    her2Receptor?: string;
  }
}
