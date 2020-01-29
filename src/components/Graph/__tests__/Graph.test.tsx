import React from 'react';
import {
  render,
  fireEvent,
  waitForDomChange,
  waitForElement,
  act,
  wait
} from '@testing-library/react';
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

  it('uses results on patientPathway', () => {
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

  it('evaluates patient on pathway', async () => {
    console.log(pathwayList[1]);
    const mockedUpdate = jest.fn();
    await act(async () => {
      render(
        <Graph
          patientPathway={pathwayList[1]}
          resources={[sampleObservation]}
          updatePatientPathwayList={mockedUpdate}
        />
      );
      await wait();
    });

    expect(mockedUpdate).toHaveBeenCalledTimes(1);
  });
});
