import React, { ReactComponentElement } from 'react';
import {
  render,
  fireEvent,
  getAllByRole,
  getAllByText,
  wait,
  act,
  RenderResult
} from '@testing-library/react';
import PathwaysList from 'components/PathwaysList';
import { evaluatePathwayCriteria, evaluatePatientOnPathway } from 'engine';

import { loadingService, loadedService, errorService } from 'testUtils/services';
import { resources, evaluatedCriteria, evaluatedPathwayResults } from 'testUtils/MockedValues';
import { Pathway, EvaluatedPathway } from 'pathways-model';

jest.mock('engine');

const renderComponent = async (component: any) => {
  let result: RenderResult | undefined;
  await act(async () => {
    result = render(component);
    await wait();
  });
  return result;
};

describe('<PathwaysList />', () => {
  let pathwayList: EvaluatedPathway[] = [];
  if (loadedService.status === 'loaded') {
    pathwayList = loadedService.payload.map(pathway => ({
      pathway: pathway,
      pathwayResults: null
    }));
  }

  it('renders loading screen', () => {
    const { getByText } = render(
      <PathwaysList
        evaluatedPathways={[]}
        callback={(): void => {
          return;
        }}
        service={loadingService}
        resources={[]}
      />
    );
    expect(getByText('Loading...')).toBeVisible();
  });

  it('renders list of pathways', async () => {
    (evaluatePathwayCriteria as jest.Mock)
      .mockResolvedValueOnce(evaluatedCriteria[0])
      .mockResolvedValueOnce(evaluatedCriteria[1])
      .mockResolvedValueOnce(evaluatedCriteria[2]);
    const result = await renderComponent(
      <PathwaysList
        evaluatedPathways={pathwayList}
        callback={(): void => {
          return;
        }}
        service={loadedService}
        resources={resources}
      />
    );
    if (result) expect(result.getAllByText(/test./)).toHaveLength(3);
    else fail();
  });

  it('renders error', () => {
    const { getByText } = render(
      <PathwaysList
        evaluatedPathways={[]}
        callback={(): void => {
          return;
        }}
        service={errorService}
        resources={[]}
      />
    );
    expect(getByText('ERROR')).toBeVisible();
  });

  it('responds to click events with pathway', async () => {
    console.error = jest.fn(); // Prevents act warning
    (evaluatePathwayCriteria as jest.Mock)
      .mockResolvedValueOnce(evaluatedCriteria[0])
      .mockResolvedValueOnce(evaluatedCriteria[1])
      .mockResolvedValueOnce(evaluatedCriteria[2]);
    (evaluatePatientOnPathway as jest.Mock).mockResolvedValue(evaluatedPathwayResults);
    let value = '';
    function setValue(text: string): void {
      value = text;
    }
    const result = await renderComponent(
      <PathwaysList
        evaluatedPathways={pathwayList}
        callback={(pathway: Pathway): void => {
          setValue(pathway.name);
        }}
        service={loadedService}
        resources={resources}
      />
    );
    if (result) {
      getAllByRole(result.container, 'listitem').forEach(node => {
        act(() => {
          fireEvent.click(node);
        });
      });
      getAllByText(result.container, 'Select Pathway').forEach(button => {
        act(() => {
          fireEvent.click(button);
        });
        expect(value !== '').toBeTruthy();
      });
    } else fail();
  });
});
