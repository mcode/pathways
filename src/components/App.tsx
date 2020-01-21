import React, { FC, useState, useEffect } from 'react';
import Header from 'components/Header';
import Navigation from 'components/Navigation';
import { PathwaysClient } from 'pathways-client';
import logo from 'camino-logo-dark.png';
import { getPatientRecord } from '../utils/fhirExtract';
import { FHIRClientProvider } from './FHIRClient';
import { PatientProvider } from './PatientProvider';
import PatientRecord from './PatientRecord/PatientRecord';
import Graph from './Graph';
import config from 'utils/ConfigManager';
import PathwaysList from './PathwaysList';
import { PathwayProvider } from './PathwayProvider';
import { Pathway } from 'pathways-model';
import useGetPathwaysService from './PathwaysService/PathwaysService';

interface AppProps {
  client: PathwaysClient; // TODO: fhirclient.Client
}

const App: FC<AppProps> = ({ client }) => {
  const [patientRecords, setPatientRecords] = useState<Array<fhir.DomainResource>>([]);
  const [pathway, setPathway] = useState<Pathway | null>(null);
  const [selectPathway, setSelectPathway] = useState<boolean>(true);

  useEffect(() => {
    getPatientRecord(client).then((records: Array<fhir.DomainResource>) => {
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

  function setPathwayCallback(value: Pathway | null, selectPathway = false): void {
    window.scrollTo(0, 0);
    setSelectPathway(selectPathway);
    setPathway(value);
  }

  interface PatientViewProps {
    patientPathway: Pathway | null;
  }
  const PatientView: FC<PatientViewProps> = ({ patientPathway }) => {
    return (
      <div>
        <div>{`Fetched ${patientRecords.length} resources`}</div>
        {patientPathway ? (
          <Graph resources={patientRecords} pathway={patientPathway} expandCurrentNode={true} />
        ) : (
          <div>No Pathway Loaded</div>
        )}
        <PatientRecord resources={patientRecords} />
      </div>
    );
  };

  return (
    <FHIRClientProvider client={client}>
      <PatientProvider>
        <PathwayProvider
          pathwayCtx={{
            pathway: pathway,
            setPathway: setPathwayCallback
          }}
        >
          <div>
            <Header logo={logo} />
            <Navigation
              service={service}
              selectPathway={selectPathway}
              setSelectPathway={setSelectPathway}
            />
          </div>
          {selectPathway ? (
            <PathwaysList
              callback={setPathwayCallback}
              service={service}
              resources={patientRecords}
            ></PathwaysList>
          ) : (
            <PatientView patientPathway={pathway} />
          )}
        </PathwayProvider>
      </PatientProvider>
    </FHIRClientProvider>
  );
};

export default App;
