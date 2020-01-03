import React from 'react';
import {
  render,
  fireEvent,
  prettyDOM,
  getAllByRole,
  getAllByText,
  wait
} from '@testing-library/react';
import PathwaysList from 'components/PathwaysList';

import { loadingService, loadedService, errorService } from 'testUtils/services';
import { Pathway } from 'pathways-model';

describe('<PathwaysList />', () => {
  it('renders loading screen', () => {
    const { getByText } = render(
      <PathwaysList
        callback={() => {
          return;
        }}
        service={loadingService}
        resources={[]}
      />
    );
    expect(getByText('Loading...')).toBeVisible();
  });

  it('renders list of pathways', () => {
    const { getAllByText } = render(
      <PathwaysList
        callback={() => {
          return;
        }}
        service={loadedService}
        resources={[]}
      />
    );
    expect(getAllByText(/test./)).toHaveLength(3);
  });

  it('renders error', () => {
    const { getByText } = render(
      <PathwaysList
        callback={() => {
          return;
        }}
        service={errorService}
        resources={[]}
      />
    );
    expect(getByText('ERROR')).toBeVisible();
  });

  it('responds to click events with pathway', () => {
    let value = '';
    function setValue(text: string) {
      value = text;
    }
    const { container } = render(
      <PathwaysList
        callback={(pathway: Pathway) => {
          setValue(pathway.name);
        }}
        service={loadedService}
        resources={[]}
      />
    );
    getAllByRole(container, 'listitem').forEach(node => {
      fireEvent.click(node);
    });
    getAllByText(container, 'Select Pathway').forEach(button => {
      fireEvent.click(button);
      expect(value !== '').toBeTruthy();
    });
  });
});
