import React, { FC, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Header from 'components/Header';
import Navigation from 'components/Navigation';
import { PathwaysClient } from 'pathways-client';
import logo from 'camino-logo-dark.png';
import { getPatientRecord } from 'utils/fhirExtract';
import { FHIRClientProvider } from './FHIRClient';
import { PatientProvider } from './PatientProvider';
import { PatientRecordsProvider } from './PatientRecordsProvider';
import PatientRecord from './PatientRecord/PatientRecord';
import Graph from './Graph';
import config from 'utils/ConfigManager';
import PathwaysList from './PathwaysList';
import { PathwayProvider } from './PathwayProvider';
import ThemeProvider from './ThemeProvider';
import { EvaluatedPathway } from 'pathways-model';
import useGetPathwaysService from './PathwaysService/PathwaysService';
import FHIR from 'fhirclient';
import { MockedFHIRClient } from 'utils/MockedFHIRClient';
import { getHumanName } from 'utils/fhirUtils';
import { DomainResource, Practitioner } from 'fhir-objects';
import styles from './App.module.scss';
import { UserProvider } from './UserProvider';
import { McodeElements } from 'mcode';
import { getFixture } from 'engine/cql-extractor';
import executeElm from 'engine/elm-executor';
interface AppProps {
  demoId?: string;
}

const App: FC<AppProps> = ({ demoId }) => {
  const [patient, setPatient] = useState<fhir.Patient | null>(null);
  const [patientRecords, _setPatientRecords] = useState<DomainResource[]>([]);
  const [mcodeRecords, _setMcodeRecords] = useState<McodeElements>({});
  const [currentPathway, setCurrentPathway] = useState<EvaluatedPathway | null>(null);
  const [selectPathway, setSelectPathway] = useState<boolean>(true);
  const [evaluatePath, setEvaluatePath] = useState<boolean>(false);
  const [evaluatedPathways, setEvaluatedPathways] = useState<EvaluatedPathway[]>([]);
  const [client, setClient] = useState<PathwaysClient | null>(null);
  const [user, setUser] = useState<string>('');
  const headerElement = useRef<HTMLDivElement>(null);
  const graphContainerElement = useRef<HTMLDivElement>(null);

  const setPatientRecords = useCallback((value: DomainResource[]): void => {
    _setPatientRecords(value);
    setEvaluatePath(true);
  }, []);

  const setMcodeRecords = useCallback((resources: DomainResource[]): void => {
    // Create a Bundle for the CQL engine
    const bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: resources.map((r: DomainResource) => ({ resource: r }))
    };
    getFixture('elm/mCODE.elm.json').then(elmString => {
      const elm = JSON.parse(elmString);
      let elmResults = executeElm(bundle, elm);
      const patientIds = Object.keys(elmResults.patientResults);
      const mcodeData = elmResults.patientResults[patientIds[0]];

      const mcodeElements: McodeElements = {
        'Primary Cancer': mcodeData['Primary Cancer Condition Value'][0] ?? undefined,
        Laterality: mcodeData['Primary Cancer Condition Body Location Value'][0] ?? undefined,
        'Tumor Category':
          mcodeData['TNM Clinical Primary Tumor Category Data Value (T Category)'][0] ?? undefined,
        'Node Category':
          mcodeData['TNM Clinical Regional Nodes Category Data Value (N Category)'][0] ?? undefined,
        'Metastases Category':
          mcodeData['TNM Clinical Distant Metastases Category Data Value (M Category)'][0] ??
          undefined,
        'Estrogen Receptor': mcodeData['Estrogen Receptor Value'][0] ?? undefined,
        'Progesterone Receptor': mcodeData['Progesterone Receptor Value'][0] ?? undefined,
        'HER2 Receptor': mcodeData['HER2 Receptor Value'][0] ?? undefined
      };

      _setMcodeRecords(mcodeElements);
    });
  }, []);

  const providerProps = useMemo(
    () => ({
      patientRecords,
      setPatientRecords,
      evaluatePath,
      setEvaluatePath,
      mcodeRecords,
      setMcodeRecords
    }),
    [
      patientRecords,
      setPatientRecords,
      evaluatePath,
      setEvaluatePath,
      mcodeRecords,
      setMcodeRecords
    ]
  );

  useEffect(() => {
    if (!demoId) {
      FHIR.oauth2
        .init({
          clientId: 'Input client id you get when you register the app',
          scope: 'launch/patient openid profile'
        })
        .then(client => {
          // TODO: MockedFHIRClient has not mocked out requests for resources yet
          getPatientRecord(client).then((records: DomainResource[]) => {
            // filters out values that are empty
            // the server might return deleted
            // resources that only include an
            // id, meta, and resourceType
            const values = ['id', 'meta', 'resourceType'];
            records = records.filter(resource => {
              return !Object.keys(resource).every(value => values.includes(value));
            });

            setPatientRecords(records);
            setMcodeRecords(records);
          });
          client.patient?.read?.().then((resultPatient: fhir.Patient) => setPatient(resultPatient));
          setClient(client);
        });
    } else {
      setClient(new MockedFHIRClient());
      const url = config.get('demoPatients') + demoId + '.json';
      fetch(url)
        .then(data => data.json())
        .then(result => {
          const resultPatient = result.find((r: DomainResource) => r.resourceType === 'Patient');
          setPatientRecords(result);
          setMcodeRecords(result);
          setPatient(resultPatient);
        });
    }
  }, [demoId, setPatientRecords]);

  // gather note info
  useEffect(() => {
    client?.user?.read().then((user: Practitioner) => {
      const name = user.name && getHumanName(user.name);
      if (name) {
        setUser(name);
      }
    });
  }, [client]);

  const service = useGetPathwaysService(
    config.get(demoId ? 'demoPathwaysService' : 'pathwaysService')
  );

  useEffect(() => {
    if (service.status === 'loaded' && evaluatedPathways.length === 0)
      setEvaluatedPathways(
        service.payload.map(pathway => ({ pathway: pathway, pathwayResults: null }))
      );
  }, [service, evaluatedPathways.length, client, patientRecords]);

  // Set the height of the graph container
  useEffect(() => {
    if (graphContainerElement?.current && headerElement?.current)
      graphContainerElement.current.style.height =
        window.innerHeight - headerElement.current.clientHeight + 'px';
  }, [selectPathway]);

  function setEvaluatedPathwayCallback(
    value: EvaluatedPathway | null,
    selectPathway = false
  ): void {
    window.scrollTo(0, 0);
    setSelectPathway(selectPathway);
    setCurrentPathway(value);
  }

  const updateEvaluatedPathways = useCallback(
    (value: EvaluatedPathway) => {
      const newList = [...evaluatedPathways]; // Create a shallow copy of list
      for (let i = 0; i < evaluatedPathways.length; i++) {
        if (evaluatedPathways[i].pathway.name === value.pathway.name) {
          newList[i] = value;
          setEvaluatedPathways(newList);
        }
      }

      if (currentPathway?.pathway.name === value.pathway.name) {
        setCurrentPathway(value);
      }
    },
    [currentPathway, evaluatedPathways]
  );

  interface PatientViewProps {
    evaluatedPathway: EvaluatedPathway | null;
  }

  const PatientView: FC<PatientViewProps> = ({ evaluatedPathway }) => {
    return (
      <div className={styles.display}>
        <PatientRecord headerElement={headerElement} />

        {evaluatedPathway ? (
          <div ref={graphContainerElement} className={styles.graph}>
            <Graph
              evaluatedPathway={evaluatedPathway}
              expandCurrentNode={true}
              updateEvaluatedPathways={updateEvaluatedPathways}
            />
          </div>
        ) : (
          <div>No Pathway Loaded</div>
        )}
      </div>
    );
  };

  return (
    <ThemeProvider>
      <FHIRClientProvider client={client as PathwaysClient}>
        <UserProvider value={{ user, setUser }}>
          <PatientProvider value={{ patient, setPatient }}>
            <PatientRecordsProvider value={providerProps}>
              <PathwayProvider
                pathwayCtx={{
                  updateEvaluatedPathways,
                  evaluatedPathway: currentPathway,
                  setEvaluatedPathway: setEvaluatedPathwayCallback
                }}
              >
                <div ref={headerElement}>
                  <Header logo={logo} />

                  <Navigation
                    evaluatedPathways={evaluatedPathways}
                    selectPathway={selectPathway}
                    setSelectPathway={setSelectPathway}
                  />
                </div>

                {selectPathway ? (
                  <PathwaysList
                    evaluatedPathways={evaluatedPathways}
                    callback={setEvaluatedPathwayCallback}
                    service={service}
                  />
                ) : (
                  <PatientView evaluatedPathway={currentPathway} />
                )}
              </PathwayProvider>
            </PatientRecordsProvider>
          </PatientProvider>
        </UserProvider>
      </FHIRClientProvider>
    </ThemeProvider>
  );
};

export default App;
