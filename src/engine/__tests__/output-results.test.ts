import { pathwayData, criteriaData } from '../output-results';

import pathway from './fixtures/pathways/sample_pathway.json';
import { resources } from 'testUtils/MockedValues';

describe('pathway results translator', () => {
  /**
   * Test patientPath1 is a typical pathway
   * To pass it must validate the surgey was completed and then add the radiation
   * to the record with the final status of incomplete by the radiation
   *
   * patient is T1N0, has completed lumpectomy surgery, and is "not-done" with radiation
   */
  it('patientPath1 produces correct results', () => {
    const patientData = {
      Patient: {
        id: {
          value: '1'
        }
      },
      'T = T0': [],
      'T = T1': [
        {
          resourceType: 'Observation',
          status: 'final',
          id: '1'
        }
      ],
      'N = N0': [
        {
          resourceType: 'Observation',
          status: 'final',
          id: '2'
        }
      ],
      'N = N1': [],
      Surgery: [
        {
          resourceType: 'Procedure',
          status: 'completed',
          id: '3'
        }
      ],
      Radiation: [
        {
          resourceType: 'Procedure',
          status: 'not-done',
          id: '4'
        }
      ],
      OtherRadiation: [],
      Chemo: [],
      ChemoMedication: []
    };
    const patientPath = pathwayData(pathway, patientData, resources);

    expect(patientPath.currentStates).toStrictEqual(['Radiation']);
    expect(patientPath.documentation).toEqual([
      {
        state: 'Start'
      },
      {
        resourceType: 'Observation',
        status: 'final',
        id: '1',
        state: 'T-test'
      },
      {
        resourceType: 'Procedure',
        status: 'completed',
        id: '3',
        state: 'Surgery'
      },
      {
        resourceType: 'Observation',
        status: 'final',
        id: '2',
        state: 'N-test'
      },
      {
        resourceType: 'Procedure',
        status: 'not-done',
        id: '4',
        state: 'Radiation'
      }
    ]);
    expect(patientPath.path).toEqual(['Start', 'T-test', 'Surgery', 'N-test', 'Radiation']);
  });

  /**
   * Test patientPath2 is a pathway which has history to continue as
   * patientPath1 except the surgery is marked incomplete. This test validates
   * the pathway will end at the pending surgery instead of continuing until radiation
   *
   * patient is T1N0, has lumpectomy surgery "in-progress"
   */
  it('patientPath2 produces correct results', () => {
    const patientData = {
      Patient: {
        id: {
          value: '1'
        }
      },
      'T = T0': [],
      'T = T1': [
        {
          resourceType: 'Observation',
          status: 'final',
          id: '1'
        }
      ],
      'N = N0': [
        {
          resourceType: 'Observation',
          status: 'final',
          id: '2'
        }
      ],
      'N = N1': [],
      Surgery: [
        {
          resourceType: 'Procedure',
          status: 'in-progress',
          id: '3'
        }
      ],
      Radiation: [],
      OtherRadiation: [],
      Chemo: [],
      ChemoMedication: []
    };
    const patientPath = pathwayData(pathway, patientData, resources);

    expect(patientPath.currentStates).toStrictEqual(['Surgery']);
    expect(patientPath.documentation).toEqual([
      {
        state: 'Start'
      },
      {
        resourceType: 'Observation',
        status: 'final',
        id: '1',
        state: 'T-test'
      },
      {
        resourceType: 'Procedure',
        status: 'in-progress',
        id: '3',
        state: 'Surgery'
      }
    ]);
    expect(patientPath.path).toEqual(['Start', 'T-test', 'Surgery']);
  });

  /**
   * Test patientPath3 is a pathway which ends on a conditional instead of an action
   *
   * patient is T0 with no further data
   */
  it('patientPath3 produces correct results', () => {
    const patientData = {
      Patient: {
        id: {
          value: '1'
        }
      },
      'T = T0': [
        {
          resourceType: 'Observation',
          status: 'final',
          id: '1'
        }
      ],
      'T = T1': [],
      'N = N0': [],
      'N = N1': [],
      Surgery: [],
      Radiation: [],
      OtherRadiation: [],
      Chemo: [],
      ChemoMedication: []
    };
    const patientPath = pathwayData(pathway, patientData, resources);

    expect(patientPath.currentStates).toStrictEqual(['N-test']);
    expect(patientPath.documentation).toEqual([
      {
        state: 'Start'
      },
      {
        resourceType: 'Observation',
        status: 'final',
        id: '1',
        state: 'T-test'
      }
    ]);
    expect(patientPath.path).toEqual(['Start', 'T-test']);
  });

  /**
   * Test patientPath4 is a typical pathway ending at Chemo
   *
   * patient is T0N1 and has completed chemo
   */
  it('patientPath4 produces correct results', () => {
    const patientData = {
      Patient: {
        id: {
          value: '1'
        }
      },
      'T = T0': [
        {
          resourceType: 'Observation',
          status: 'final',
          id: '1'
        }
      ],
      'T = T1': [],
      'N = N0': [],
      'N = N1': [
        {
          resourceType: 'Observation',
          status: 'final',
          id: '2'
        }
      ],
      Surgery: [],
      Radiation: [],
      OtherRadiation: [],
      Chemo: [
        {
          resourceType: 'Procedure',
          status: 'completed',
          id: '3'
        }
      ],
      ChemoMedication: [
        {
          resourceType: 'MedicationRequest',
          status: 'completed',
          id: '4'
        }
      ]
    };
    const patientPath = pathwayData(pathway, patientData, resources);

    expect(patientPath.currentStates).toStrictEqual(['Chemo']);
    expect(patientPath.documentation).toEqual([
      {
        state: 'Start'
      },
      {
        resourceType: 'Observation',
        status: 'final',
        id: '1',
        state: 'T-test'
      },
      {
        resourceType: 'Observation',
        status: 'final',
        id: '2',
        state: 'N-test'
      },
      {
        resourceType: 'MedicationRequest',
        status: 'completed',
        id: '4',
        state: 'ChemoMedication'
      },
      {
        resourceType: 'Procedure',
        status: 'completed',
        id: '3',
        state: 'Chemo'
      }
    ]);
    expect(patientPath.path).toEqual(['Start', 'T-test', 'N-test', 'ChemoMedication', 'Chemo']);
  });

  /**
   * Test patientPath5 is a pathway to chemo where the medication request has not
   * been completed so the pathway should end in the request instead of continuing
   * on to the actual procedure
   *
   * patient is T0N1 and has requeted chemo medication
   */
  it('patientPath5 produces correct results', () => {
    const patientData = {
      Patient: {
        id: {
          value: '1'
        }
      },
      'T = T0': [
        {
          resourceType: 'Observation',
          status: 'final',
          id: '1'
        }
      ],
      'T = T1': [],
      'N = N0': [],
      'N = N1': [
        {
          resourceType: 'Observation',
          status: 'final',
          id: '2'
        }
      ],
      Surgery: [],
      Radiation: [],
      OtherRadiation: [],
      Chemo: [],
      ChemoMedication: [
        {
          resourceType: 'MedicationRequest',
          status: 'active',
          id: '3'
        }
      ]
    };
    const patientPath = pathwayData(pathway, patientData, resources);

    expect(patientPath.currentStates).toStrictEqual(['Chemo']);
    expect(patientPath.documentation).toEqual([
      {
        state: 'Start'
      },
      {
        resourceType: 'Observation',
        status: 'final',
        id: '1',
        state: 'T-test'
      },
      {
        resourceType: 'Observation',
        status: 'final',
        id: '2',
        state: 'N-test'
      },
      {
        resourceType: 'MedicationRequest',
        status: 'active',
        id: '3',
        state: 'ChemoMedication'
      }
    ]);
    expect(patientPath.path).toEqual(['Start', 'T-test', 'N-test', 'ChemoMedication']);
  });

  /**
   * Test patientPath6 is a pathway which ends on an action with no resource
   * in the health file corresponding to that action. There are two options
   *
   * patient is T1N0, has completed lumpectomy surgey, and has no resource for radiation therapy
   */
  it('patientPath6 produces correct results', () => {
    const patientData = {
      Patient: {
        id: {
          value: '1'
        }
      },
      'T = T0': [],
      'T = T1': [
        {
          resourceType: 'Observation',
          status: 'final',
          id: '1'
        }
      ],
      'N = N0': [
        {
          resourceType: 'Observation',
          status: 'final',
          id: '2'
        }
      ],
      'N = N1': [],
      Surgery: [
        {
          resourceType: 'Procedure',
          status: 'completed',
          id: '3'
        }
      ],
      Radiation: [],
      OtherRadiation: [],
      Chemo: [],
      ChemoMedication: []
    };
    const patientPath = pathwayData(pathway, patientData, resources);

    expect(patientPath.currentStates).toStrictEqual(['Radiation', 'OtherRadiation']);
    expect(patientPath.documentation).toEqual([
      {
        state: 'Start'
      },
      {
        resourceType: 'Observation',
        status: 'final',
        id: '1',
        state: 'T-test'
      },
      {
        resourceType: 'Procedure',
        status: 'completed',
        id: '3',
        state: 'Surgery'
      },
      {
        resourceType: 'Observation',
        status: 'final',
        id: '2',
        state: 'N-test'
      }
    ]);
    expect(patientPath.path).toEqual(['Start', 'T-test', 'Surgery', 'N-test']);
  });
});

describe('criteria results translator', () => {
  it('matching patient produces correct results', () => {
    const patientData = {
      Patient: {
        id: {
          value: '1'
        }
      },
      Condition: [
        {
          value: 'Malignant neoplasm of breast (disorder)',
          match: true
        }
      ]
    };

    const results = criteriaData(pathway, patientData);

    expect(results).toEqual({
      pathwayName: 'test_breast_cancer',
      matches: 1,
      criteriaResultItems: [
        {
          elementName: 'Condition',
          expected: 'Breast Cancer',
          actual: 'Malignant neoplasm of breast (disorder)',
          match: true
        }
      ]
    });
  });

  it('nonmatching patient produces correct results', () => {
    const patientData = {
      Patient: {
        id: {
          value: '2'
        }
      },
      Condition: [
        {
          value: 'Gastrointestinal stromal tumor (disorder)',
          match: false
        }
      ]
    };

    const results = criteriaData(pathway, patientData);

    expect(results).toEqual({
      pathwayName: 'test_breast_cancer',
      matches: 0,
      criteriaResultItems: [
        {
          elementName: 'Condition',
          expected: 'Breast Cancer',
          actual: 'Gastrointestinal stromal tumor (disorder)',
          match: false
        }
      ]
    });
  });
});
