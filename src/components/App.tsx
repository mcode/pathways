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
import { Pathway } from 'pathways-model';
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
      // filters out values that are empty
      // the server might return deleted
      // resources that only include an
      // id, meta, and resourceType
      const values = ['id', 'meta', 'resourceType'];
      records = records.filter(resource => {
        return !Object.keys(resource).every(value => values.includes(value));
      });
      setPatientRecords(records);
    });
  }, [client]);

  const service = useGetPathwaysService(config.get('pathwaysService'));

  function setPathwayCallback(value: Pathway | null): void {
    setSelectPathway(false);
    setPathway(value);
    console.log('App::pathway');
    console.log(value);
    console.log(pathway);
  }

  function renderPatientView() {
    return (
      <div>
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
      </div>
    );
  }

  return (
    <FHIRClientProvider client={client}>
      <PatientProvider>
        <PathwayProvider pathway={{ pathway: pathway, setPathway: setPathwayCallback }}>
          <div>
            <Header logo={logo} title={config.get('appName', 'SMART App')} />
            <Navigation service={service} selectPathway={selectPathway} />
          </div>
          {selectPathway ? (
            <PathwaysList callback={setPathwayCallback} service={service}></PathwaysList>
          ) : (
            renderPatientView()
          )}
        </PathwayProvider>
      </PatientProvider>
    </FHIRClientProvider>
  );
};

export default App;
