import pathwayData from '../output-results';

import pathway from './fixtures/pathways/sample_pathway.json';

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
      Chemo: [],
      ChemoMedication: []
    };
    const patientPath = pathwayData(pathway, patientData);

    expect(patientPath.currentState).toBe('Radiation');
    expect(patientPath.currentStatus).toBe('not-done');
    expect(patientPath.nextRecommendation).toBe('pathway terminal');
    expect(patientPath.documentation).toEqual([
      'direct',
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
      Chemo: [],
      ChemoMedication: []
    };
    const patientPath = pathwayData(pathway, patientData);

    expect(patientPath.currentState).toBe('Surgery');
    expect(patientPath.currentStatus).toBe('in-progress');
    expect(patientPath.nextRecommendation).toBe('N-test');
    expect(patientPath.documentation).toEqual([
      'direct',
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
      Chemo: [],
      ChemoMedication: []
    };
    const patientPath = pathwayData(pathway, patientData);

    expect(patientPath.currentState).toBe('N-test');
    expect(patientPath.currentStatus).toBe('not-done');
    expect(patientPath.nextRecommendation).toEqual([
      {
        state: 'Radiation',
        conditionDescription: 'N = N0'
      },
      {
        state: 'ChemoMedication',
        conditionDescription: 'N = N1'
      }
    ]);
    expect(patientPath.documentation).toEqual([
      'direct',
      {
        resourceType: 'Observation',
        status: 'final',
        id: '1',
        state: 'T-test'
      }
    ]);
    expect(patientPath.path).toEqual(['Start', 'T-test', 'N-test']);
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
    const patientPath = pathwayData(pathway, patientData);

    expect(patientPath.currentState).toBe('Chemo');
    expect(patientPath.currentStatus).toBe('completed');
    expect(patientPath.nextRecommendation).toBe('pathway terminal');
    expect(patientPath.documentation).toEqual([
      'direct',
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
      Chemo: [],
      ChemoMedication: [
        {
          resourceType: 'MedicationRequest',
          status: 'active',
          id: '3'
        }
      ]
    };
    const patientPath = pathwayData(pathway, patientData);

    expect(patientPath.currentState).toBe('Chemo');
    expect(patientPath.currentStatus).toBe('not-done');
    expect(patientPath.nextRecommendation).toBe('pathway terminal');
    expect(patientPath.documentation).toEqual([
      'direct',
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
    expect(patientPath.path).toEqual(['Start', 'T-test', 'N-test', 'ChemoMedication', 'Chemo']);
  });

  /**
   * Test patientPath6 is a pathway which ends on an action with no resource
   * in the health file corresponding to that action
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
      Chemo: [],
      ChemoMedication: []
    };
    const patientPath = pathwayData(pathway, patientData);

    expect(patientPath.currentState).toBe('Radiation');
    expect(patientPath.currentStatus).toBe('not-done');
    expect(patientPath.nextRecommendation).toBe('pathway terminal');
    expect(patientPath.documentation).toEqual([
      'direct',
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
    expect(patientPath.path).toEqual(['Start', 'T-test', 'Surgery', 'N-test', 'Radiation']);
  });
});
