import React from 'react';
import { render, act } from '@testing-library/react';
import Graph from '../Graph';
import { loadedService } from 'testUtils/services';
import { EvaluatedPathway } from 'pathways-model';
import preconvertedELM from '../../../engine/__tests__/fixtures/elm/sample_pathway.elm.json';

describe('<Graph />', () => {
  global.fetch = jest.fn(() => Promise.resolve({ json: () => preconvertedELM, text: () => '' }));

  let pathwayList: EvaluatedPathway[] = [];
  if (loadedService.status === 'loaded') {
    pathwayList = loadedService.payload.map(pathway => ({
      pathway: pathway,
      pathwayResults: null
    }));
  }

  const samplePatient = {
    resourceType: 'Patient',
    id: 'bob'
  };

  const sampleObservation = {
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

  it('uses results on evaluatedPathway', async () => {
    const mockedUpdate = jest.fn();
    const evaluatedPathway = pathwayList[0];
    evaluatedPathway.pathwayResults = {
      patientId: 'test',
      currentState: 'Start',
      currentStatus: '',
      nextRecommendation: '',
      documentation: [],
      path: ['Start']
    };

    // eslint-disable-next-line
    await act(async () => {
      render(
        <Graph
          evaluatedPathway={evaluatedPathway}
          resources={[samplePatient, sampleObservation]}
          updateEvaluatedPathways={mockedUpdate}
        />
      );
    });

    expect(mockedUpdate).toHaveBeenCalledTimes(0);
  });

  it('evaluates patient on pathway', async () => {
    const mockedUpdate = jest.fn();

    // eslint-disable-next-line
    await act(async () => {
      render(
        <Graph
          evaluatedPathway={pathwayList[1]}
          resources={[samplePatient, sampleObservation]}
          updateEvaluatedPathways={mockedUpdate}
        />
      );
    });

    expect(mockedUpdate).toHaveBeenCalledTimes(1);
  });
});
