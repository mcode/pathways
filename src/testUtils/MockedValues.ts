import { CriteriaResult, PathwayResults } from 'pathways-model';

export const resources: fhir.DomainResource[] = [
  {
    resourceType: 'Patient',
    id: '126040',
    meta: {
      versionId: '1',
      lastUpdated: '2019-08-22T17:03:11.110+00:00',
      profile: ['http://hl7.org/fhir/us/shr/DSTU2/StructureDefinition/shr-core-Patient']
    }
  }
];

export const evaluatedCriteria: CriteriaResult[] = [
  {
    pathwayName: 'test1',
    matches: 1,
    criteriaResultItems: [
      {
        elementName: 'condition',
        expected: 'breast Cancer',
        actual: 'Malignant neoplasm of breast (disorder)',
        match: true
      }
    ]
  },
  {
    pathwayName: 'test2',
    matches: 0,
    criteriaResultItems: [
      {
        elementName: 'condition',
        expected: 'gist Cancer',
        actual: 'Malignant neoplasm of breast (disorder)',
        match: false
      }
    ]
  },
  {
    pathwayName: 'test3',
    matches: 0,
    criteriaResultItems: [
      {
        elementName: 'condition',
        expected: 'lung Cancer',
        actual: 'Malignant neoplasm of breast (disorder)',
        match: false
      }
    ]
  }
];

export const evaluatedPathwayResults: PathwayResults = {
  patientId: '1',
  currentStates: ['Start'],
  documentation: {
    Start: {
      state: 'Start',
      onPath: true
    }
  }
};
