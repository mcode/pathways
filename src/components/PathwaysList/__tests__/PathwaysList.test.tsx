import React from 'react';
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
import { evaluatePathwayPrecondition, evaluatePatientOnPathway } from 'engine';

import { loadingService, loadedService, errorService } from 'testUtils/services';
import { evaluatedPrecondition, evaluatedPathwayResults } from 'testUtils/MockedValues';
import { Pathway, EvaluatedPathway } from 'pathways-model';
import MockedPatientRecordsProvider from 'testUtils/MockedPatientRecordsProvider';
import MockedPatientProvider from 'testUtils/MockedPatientProvider';

jest.mock('engine');

const renderComponent = async (
  component: React.ReactElement
): Promise<RenderResult | undefined> => {
  let result: RenderResult | undefined;
  await act(async () => {
    result = render(
      <MockedPatientProvider>
        <MockedPatientRecordsProvider>{component}</MockedPatientRecordsProvider>
      </MockedPatientProvider>
    );
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
      />
    );
    expect(getByText('Loading...')).toBeVisible();
  });

  it('renders list of pathways', async () => {
    (evaluatePathwayPrecondition as jest.Mock)
      .mockResolvedValueOnce(evaluatedPrecondition[0])
      .mockResolvedValueOnce(evaluatedPrecondition[1])
      .mockResolvedValueOnce(evaluatedPrecondition[2]);
    const result = await renderComponent(
      <PathwaysList
        evaluatedPathways={pathwayList}
        callback={(): void => {
          return;
        }}
        service={loadedService}
      />
    );
    expect(result?.getAllByText(/test./)).toHaveLength(3);
  });

  it('renders error', () => {
    const { getByText } = render(
      <PathwaysList
        evaluatedPathways={[]}
        callback={(): void => {
          return;
        }}
        service={errorService}
      />
    );
    expect(getByText('ERROR')).toBeVisible();
  });

  it('responds to click events with pathway', async () => {
    // eslint-disable-next-line
    console.error = jest.fn(); // Prevents act warning
    (evaluatePathwayPrecondition as jest.Mock)
      .mockResolvedValueOnce(evaluatedPrecondition[0])
      .mockResolvedValueOnce(evaluatedPrecondition[1])
      .mockResolvedValueOnce(evaluatedPrecondition[2]);
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
      />
    );
    if (result) {
      getAllByRole(result.container, 'listitem').forEach(node => {
        act(() => {
          fireEvent.click(node);
        });
      });
      getAllByText(result.container, 'View').forEach(button => {
        act(() => {
          fireEvent.click(button);
        });
        expect(value !== '').toBeTruthy();
      });
    } else fail();
  });
});
