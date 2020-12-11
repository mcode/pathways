import { pathwayData, preconditionData } from '../output-results';

import pathway from './fixtures/pathways/sample_pathway.json';
import { resources } from 'testUtils/MockedValues';

describe('pathway results translator', () => {
  /**
   * Test patientPath1 is a typical pathway
   * patient is T2N0, has completed chemotherapy tchp, and is not started surgery
   */
  it('patientPath1 produces correct results', () => {
    const patientData = {
      Patient: {
        id: {
          value: '1'
        }
      },
      'T <= 2': false,
      'T > 2': true,
      'N0': true,
      'N+': false,
      'ChemotherapyTCHP': [
        {
          resourceType: 'MedicationRequest',
          status: 'completed',
          id: '2'
        }
      ]
    };
    const patientPath = pathwayData(pathway, patientData, resources);
    expect(patientPath.currentNodes).toStrictEqual(['SurgeryMainPath']);
    expect(patientPath.documentation).toEqual({
      Start: {
        node: 'Start',
        onPath: true
      },
      'TumorSize': {
        node: 'TumorSize',
        onPath: true
      },
      ChemotherapyTCHP: {
        resourceType: 'MedicationRequest',
        status: 'completed',
        id: '2',
        node: 'ChemotherapyTCHP',
        onPath: true
      }
    });
  });

  /**
   * Test patientPath2 is a pathway which has history to continue as
   * patientPath1 except the surgery is marked incomplete. This test validates
   * the pathway will end at the pending surgery instead of continuing until radiation
   *
   * patient is T2N0, has lumpectomy surgery "in-progress"
   */
  it('patientPath2 produces correct results', () => {
    const patientData = {
      Patient: {
        id: {
          value: '1'
        }
      },
      'T <= 2': false,
      'T > 2': true,
      'N0': true,
      'N+': false,
      'ChemotherapyTCHP': [
        {
          resourceType: 'MedicationRequest',
          status: 'completed',
          id: '2'
        }
      ],
      'SurgeryMainPath': [
        {
          resourceType: 'ServiceRequest',
          status: 'active',
          id: '3'
        }
      ]
    };
    const patientPath = pathwayData(pathway, patientData, resources);

    expect(patientPath.currentNodes).toStrictEqual(['SurgeryMainPath']);
    expect(patientPath.documentation).toEqual({
      Start: {
        node: 'Start',
        onPath: true
      },
      'TumorSize': {
        node: 'TumorSize',
        onPath: true
      },
      ChemotherapyTCHP: {
        resourceType: 'MedicationRequest',
        status: 'completed',
        id: '2',
        node: 'ChemotherapyTCHP',
        onPath: true
      },
      SurgeryMainPath: {
        resourceType: 'ServiceRequest',
        status: 'active',
        id: '3',
        node: 'SurgeryMainPath',
        onPath: true
      }
    });
  });

  /**
   * Test patientPath3 is a pathway which ends on a conditional instead of an action
   *
   * patient is T0 with no further data on path but completed a med regimen (not on path)
   */
  it('patientPath3 produces correct results', () => {
    const patientData = {
      Patient: {
        id: {
          value: '1'
        }
      },
      'T <= 2': true,
      'T > 2': false,
      'N0': false,
      'N+': false,
      PaclitaxelandTrastuzumab: [
        {
          resourceType: 'MedicationRequest',
          status: 'completed',
          id: '2'
        }
      ]
    };
    const patientPath = pathwayData(pathway, patientData, resources);

    expect(patientPath.currentNodes).toStrictEqual(['NodeStatus']);
    expect(patientPath.documentation).toEqual({
      Start: {
        node: 'Start',
        onPath: true
      },
      'TumorSize': {
        node: 'TumorSize',
        onPath: true
      },
      PaclitaxelandTrastuzumab: {
        resourceType: 'MedicationRequest',
        status: 'completed',
        id: '2',
        node: 'PaclitaxelandTrastuzumab',
        onPath: false
      }
    });
  });

  /**
   * Test patientPath4 is a typical pathway ending at a chemo regimen
   *
   * patient is T1N0 and has completed surgery and chemo
   */
  it('patientPath4 produces correct results', () => {
    const patientData = {
      Patient: {
        id: {
          value: '1'
        }
      },
      'T <= 2': true,
      'T > 2': false,
      'N0': true,
      'N+': false,
      SurgeryN0Path: [
        {
          resourceType: 'Procedure',
          status: 'completed',
          id: '3'
        }
      ],
      PaclitaxelandTrastuzumab: [
        {
          resourceType: 'MedicationRequest',
          status: 'completed',
          id: '4'
        }
      ]
    };
    const patientPath = pathwayData(pathway, patientData, resources);

    expect(patientPath.currentNodes).toStrictEqual(['PaclitaxelandTrastuzumab']);
    expect(patientPath.documentation).toEqual({
      Start: {
        node: 'Start',
        onPath: true
      },
      'TumorSize': {
        node: 'TumorSize',
        onPath: true
      },
      'NodeStatus': {
        node: 'NodeStatus',
        onPath: true
      },
      PaclitaxelandTrastuzumab: {
        resourceType: 'MedicationRequest',
        status: 'completed',
        id: '4',
        node: 'PaclitaxelandTrastuzumab',
        onPath: true
      },
      SurgeryN0Path: {
        resourceType: 'Procedure',
        status: 'completed',
        id: '3',
        node: 'SurgeryN0Path',
        onPath: true
      }
    });
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
      'T <= 2': true,
      'T > 2': false,
      'N0': false,
      'N+': true,
      ChemotherapyACTHP: [
        {
          resourceType: 'MedicationRequest',
          status: 'active',
          id: '3'
        }
      ]
    };
    const patientPath = pathwayData(pathway, patientData, resources);

    expect(patientPath.currentNodes).toStrictEqual(['ChemotherapyACTHP']);
    expect(patientPath.documentation).toEqual({
      Start: {
        node: 'Start',
        onPath: true
      },
      'TumorSize': {
        node: 'TumorSize',
        onPath: true
      },
      'NodeStatus': {
        node: 'NodeStatus',
        onPath: true
      },
      ChemotherapyACTHP: {
        resourceType: 'MedicationRequest',
        status: 'active',
        id: '3',
        node: 'ChemotherapyACTHP',
        onPath: true
      }
    });
  });

  /**
   * Test patientPath6 is a pathway which ends on an action with no resource
   * in the health file corresponding to that action. There are three options
   *
   * patient is T1N1, has completed lumpectomy surgey, and has no resource for radiation therapy
   */
  it('patientPath6 produces correct results', () => {
    const patientData = {
      Patient: {
        id: {
          value: '1'
        }
      },
      'T <= 2': true,
      'T > 2': false,
      'N0': false,
      'N+': true
    };
    const patientPath = pathwayData(pathway, patientData, resources);

    expect(patientPath.currentNodes).toStrictEqual(['ChemotherapyTCHP', 'ChemotherapyACTHP', 'ChemotherapyddACTHP']);
    expect(patientPath.documentation).toEqual({
      Start: {
        node: 'Start',
        onPath: true
      },
      'TumorSize': {
        node: 'TumorSize',
        onPath: true
      },
      'NodeStatus': {
        node: 'NodeStatus',
        onPath: true
      }
    });
  });
});

describe('precondition results translator', () => {
  it('matching patient produces correct results', () => {
    const patientData = {
      Patient: {
        id: {
          value: '1'
        }
      },
      "Cancer Condition": [
        {
          value: 'Malignant neoplasm of breast (disorder)',
          match: true
        }
      ]
    };

    const results = preconditionData(pathway, patientData);

    expect(results).toEqual({
      pathwayName: 'test_breast_cancer',
      matches: 1,
      preconditionResultItems: [
        {
          elementName: 'Cancer Condition',
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
      "Cancer Condition": [
        {
          value: 'Non-small cell lung cancer (disorder)',
          match: false
        }
      ]
    };

    const results = preconditionData(pathway, patientData);

    expect(results).toEqual({
      pathwayName: 'test_breast_cancer',
      matches: 0,
      preconditionResultItems: [
        {
          elementName: 'Cancer Condition',
          expected: 'Breast Cancer',
          actual: 'Non-small cell lung cancer (disorder)',
          match: false
        }
      ]
    });
  });
});
