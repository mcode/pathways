import React, { FC, useState } from 'react';
import { Pathway } from 'pathways-model';
import Navigation from 'components/Navigation';
import MockedPatientProvider from 'testUtils/MockedPatientProvider';
import MockedPathwayProvider from 'testUtils/MockedPathwayProvider';
import { loadedService } from './services';

const MockedNavigation: FC = ({}) => {
  const [pathway, setPathway] = useState<Pathway | null>(null);

  function setPathwayCallback(value: Pathway | null, selectPathway: boolean = false) {
    if (value !== null) setPathway(value);
  }

  return (
    <MockedPatientProvider>
      <MockedPathwayProvider pathwayCtx={{ pathway: pathway, setPathway: setPathwayCallback }}>
        <Navigation selectPathway={false} service={loadedService} setSelectPathway={() => {}} />
      </MockedPathwayProvider>
    </MockedPatientProvider>
  );
};

export default MockedNavigation;
