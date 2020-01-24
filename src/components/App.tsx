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
import { PatientPathway } from 'pathways-model';
import useGetPathwaysService from './PathwaysService/PathwaysService';

interface AppProps {
  client: PathwaysClient; // TODO: fhirclient.Client
}

const App: FC<AppProps> = ({ client }) => {
  const [patientRecords, setPatientRecords] = useState<Array<fhir.DomainResource>>([]);
  const [currentPathway, setCurrentPathway] = useState<PatientPathway | null>(null);
  const [selectPathway, setSelectPathway] = useState<boolean>(true);
  const [patientPathwayList, setPatientPathwayList] = useState<PatientPathway[]>([]);

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

  useEffect(() => {
    if (service.status === 'loaded' && patientPathwayList.length === 0)
      setPatientPathwayList(
        service.payload.map(pathway => ({ pathway: pathway, pathwayResults: null }))
      );
  }, [service, patientPathwayList.length, client]);

  function setPatientPathwayCallback(value: PatientPathway | null, selectPathway = false): void {
    window.scrollTo(0, 0);
    setSelectPathway(selectPathway);
    setCurrentPathway(value);
  }

  function updatePatientPathwayList(value: PatientPathway) {
    let newList = [...patientPathwayList]; // Create a deep copy of list
    for (let i in patientPathwayList) {
      if (patientPathwayList[i].pathway.name === value.pathway.name) {
        newList[i] = value;
        setPatientPathwayList(newList);
      }
    }

    if (currentPathway?.pathway.name === value.pathway.name) {
      setCurrentPathway(value);
    }
  }

  interface PatientViewProps {
    patientPathway: PatientPathway | null;
  }

  const PatientView: FC<PatientViewProps> = ({ patientPathway }) => {
    return (
      <div>
        <div>{`Fetched ${patientRecords.length} resources`}</div>
        {patientPathway ? (
          <Graph
            resources={patientRecords}
            patientPathway={patientPathway}
            expandCurrentNode={true}
            updatePatientPathwayList={updatePatientPathwayList}
          />
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
            patientPathway: currentPathway,
            setPatientPathway: setPatientPathwayCallback,
            updatePatientPathwayList: updatePatientPathwayList
          }}
        >
          <div>
            <Header logo={logo} />
            <Navigation
              patientPathwayList={patientPathwayList}
              selectPathway={selectPathway}
              setSelectPathway={setSelectPathway}
            />
          </div>
          {selectPathway ? (
            <PathwaysList
              patientPathwayList={patientPathwayList}
              callback={setPatientPathwayCallback}
              service={service}
              resources={patientRecords}
            ></PathwaysList>
          ) : (
            <PatientView patientPathway={currentPathway} />
          )}
        </PathwayProvider>
      </PatientProvider>
    </FHIRClientProvider>
  );
};

export default App;
