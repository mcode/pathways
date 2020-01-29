import React from 'react';
import { render, fireEvent, waitForDomChange, waitForElement } from '@testing-library/react';
import Graph from '../Graph';

import { loadedService } from 'testUtils/services';
import { PatientPathway } from 'pathways-model';

describe('<Graph />', () => {
  let pathwayList: PatientPathway[] = [];
  if (loadedService.status === 'loaded') {
    pathwayList = loadedService.payload.map(pathway => ({
      pathway: pathway,
      pathwayResults: null
    }));
  }

  let sampleObservation = {
    resourceType: 'Observation',
    id: '1df2fbca-1f12-45f2-9e5c-6a8e249dcf8d',
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'imaging',
            display: 'imaging'
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '44667-4',
          display: 'Site of distant metastasis in Breast tumor'
        }
      ],
      text: 'Site of distant metastasis in Breast tumor'
    },
    effectiveDateTime: '2014-11-06T09:27:09-05:00',
    issued: '2014-11-06T09:27:09.556-05:00'
  };

  it('Graph uses results on patientPathway', () => {
    const mockedUpdate = jest.fn();
    let patientPathway = pathwayList[0];
    patientPathway.pathwayResults = {
      patientId: 'test',
      currentState: 'Start',
      currentStatus: '',
      nextRecommendation: '',
      documentation: [],
      path: ['Start']
    };

    render(
      <Graph
        patientPathway={patientPathway}
        resources={[sampleObservation]}
        updatePatientPathwayList={mockedUpdate}
      />
    );

    expect(mockedUpdate).toHaveBeenCalledTimes(0);
  });

  it('Graph evaluates patient on pathway', async () => {
    console.log(pathwayList[0]);
    const mockedUpdate = jest.fn();
    render(
      <Graph
        patientPathway={pathwayList[0]}
        resources={[sampleObservation]}
        updatePatientPathwayList={mockedUpdate}
      />
    );

    await waitForDomChange();
    expect(mockedUpdate).toHaveBeenCalledTimes(1);
  });
});
