import React, { FC, useState, useEffect } from 'react';

import Header from 'components/Header';
import Navigation from 'components/Navigation';

import logo from '../logo.svg';
import { getPatientRecord } from '../utils/fhirExtract';
import { FHIRClientProvider } from './FHIRClient';
import { PatientProvider } from './PatientProvider';
import PatientRecord from './PatientRecord/PatientRecord';
import Graph from './Graph';
import config from 'utils/ConfigManager';
import PathwaysList from './PathwaysList';
import PathwaysDisplay from 'components/PathwaysDisplay';
import { PathwayProvider } from './PathwayProvider';
import { Pathway } from 'pathways-objects';
import useGetPathwaysService from './PathwaysService/PathwaysService';

interface AppProps {
  client: any; // TODO: fhirclient.Client
}

const App: FC<AppProps> = ({ client }) => {
  const [patientRecords, setPatientRecords] = useState<Array<any>>([]);
  const [pathway, setPathway] = useState<Pathway | null>(null);
  const [selectPathway, setSelectPathway] = useState<boolean>(true);

  useEffect(() => {
    getPatientRecord(client).then((records: Array<any>) => {
      setPatientRecords(records);
    });
  }, [client]);

  const service = useGetPathwaysService(config.get('pathwaysService'));

  function setPathwayCallback(value: Pathway | null) {
    setSelectPathway(false);
    setPathway(value);
  }

  function renderPatientView() {
    return (
      <PathwayProvider pathway={pathway}>
        <div>{`Fetched ${patientRecords.length} resources`}</div>
        <PathwaysDisplay />
        <button
          onClick={() => {
            setSelectPathway(true);
          }}
        >
          Explore Pathways
        </button>
        <Graph resources={patientRecords} />
        <PatientRecord resources={patientRecords} />
      </PathwayProvider>
    );
  }

  return (
    <FHIRClientProvider client={client}>
      <PatientProvider>
        <div>
          <Header logo={logo} title={config.get('appName', 'SMART App')} />
          <Navigation />
        </div>
        {selectPathway ? (
          <PathwaysList callback={setPathwayCallback} service={service}></PathwaysList>
        ) : (
          renderPatientView()
        )}
      </PatientProvider>
    </FHIRClientProvider>
  );
};

export default App;
