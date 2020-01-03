import React from 'react';
import { render, fireEvent, getByRole, getByText } from '@testing-library/react';
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
    const component = render(
      <PathwaysList
        callback={(pathway: Pathway) => {
          setValue(pathway.name);
        }}
        service={loadedService}
        resources={[]}
      />
    );
    component.getAllByRole('listitem').forEach(node => {
      fireEvent.click(node);
      // TODO: Fix this test so it expands the node and then
      // clicks on the "Select Pathway" button
      // getByText(node, 'SELECT PATHWAY');
      // expect(node.innerHTML).toContain(value);
    });
  });
});
