import React from 'react';
import { render } from '@testing-library/react';
import PathwaysList from '../PathwaysList';
import { Pathway, Service, Pathways } from 'pathways-objects';

import {loadingService, loadedService, errorService} from '../../../testUtils/services';

describe('<PathwaysList />', () => {
  it('renders loading screen', () => {
    const {getByText} = render(<PathwaysList callback={()=>{return}} service={loadingService} />);
    expect(getByText("Loading...")).toBeVisible();
  });

  it('renders list of pathways', () => {
    const {getAllByText} = render(<PathwaysList callback={()=>{return}} service={loadedService} />);
    expect(getAllByText(/test./)).toHaveLength(6);

  });

  it('renders error', () => {
      const {getByText} = render(<PathwaysList callback={()=>{return}} service={errorService} />);
      expect(getByText("ERROR")).toBeVisible();
  });

  it('responds to click events with pathway', () => {
      let value = "";
      function setValue(text: string){
          value = text
      }
      const component = render(<PathwaysList callback={(pathway:Pathway)=>{setValue(pathway.name)}} service={loadedService} />);
      component.getAllByText(/Name./).forEach((node)=>{
          node.click();
          expect(node.innerHTML).toContain(value);
      })
  })
});
