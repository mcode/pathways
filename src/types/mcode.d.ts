declare module 'mcode' {
  import { Condition, Observation } from 'fhir-objects';
  export interface McodeElements {
    'Primary Cancer'?: string;
    Laterality?: string;
    'Tumor Category'?: string;
    'Node Category'?: string;
    'Metastases Category'?: string;
    'Estrogen Receptor'?: string;
    'Progesterone Receptor'?: string;
    'HER2 Receptor'?: string;
  }
}
