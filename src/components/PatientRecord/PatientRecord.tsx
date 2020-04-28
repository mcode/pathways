import React, { FC, useState, useEffect, useRef, RefObject } from 'react';
import { usePatient } from 'components/PatientProvider';
import { usePatientRecords } from 'components/PatientRecordsProvider';
import {
  AllergiesVisualizer,
  CarePlansVisualizer,
  ConditionsVisualizer,
  EncountersVisualizer,
  ImmunizationsVisualizer,
  MedicationsVisualizer,
  ObservationsVisualizer,
  PatientVisualizer,
  ProceduresVisualizer,
  ReportsVisualizer
} from 'fhir-visualizers';
import { DomainResource } from 'fhir-objects';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faNotesMedical,
  faChevronLeft,
  faChevronUp,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import styles from './PatientRecord.module.scss';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { CriteriaResult } from 'pathways-model';
import { usePathwayContext } from 'components/PathwayProvider';
import { evaluatePathwayCriteria } from 'engine';
import { McodeElements } from 'mcode';

const resourceTypes = [
  'Pathway',
  'Mcode',
  'Patient',
  'Condition',
  'Observation',
  'DiagnosticReport',
  'MedicationRequest',
  'AllergyIntolerance',
  'CarePlan',
  'Procedure',
  'Encounter',
  'Immunization'
];

const groupResourceByType = (
  patientRecord: ReadonlyArray<DomainResource>
): ReadonlyMap<string, ReadonlyArray<DomainResource>> => {
  const map: Map<string, DomainResource[]> = new Map();
  patientRecord.forEach(resource => {
    const resourceType = resource.resourceType ?? '';
    if (resourceTypes.includes(resourceType)) {
      const collection = map.get(resourceType);
      if (!collection) map.set(resourceType, [resource]);
      else collection.push(resource);
    }
  });
  return map;
};

const getResourcesByType = (
  resourceType: string,
  groupedResources: ReadonlyMap<string, ReadonlyArray<DomainResource>>
): ReadonlyArray<DomainResource> => {
  return groupedResources.get(resourceType) ?? [];
};

interface PatientRecordProps {
  headerElement: RefObject<HTMLDivElement>;
}

interface PatientRecordElementProps {
  resourceType: string;
  resources: ReadonlyArray<DomainResource>;
}

interface VisualizerProps {
  resourceType: string;
  resourcesByType: ReadonlyArray<DomainResource>;
}

const PatientRecord: FC<PatientRecordProps> = ({ headerElement }) => {
  const { patientRecords } = usePatientRecords();
  const recordContainerElement = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const groupedResources = groupResourceByType(patientRecords);

  const expand = (): void => {
    setIsExpanded(!isExpanded);
  };

  // Set the height of the patient record container
  useEffect(() => {
    if (recordContainerElement?.current && headerElement?.current)
      recordContainerElement.current.style.height =
        window.innerHeight - headerElement.current.clientHeight + 'px';
  }, [isExpanded, headerElement]);

  if (isExpanded) {
    return (
      <div className={styles.record} ref={recordContainerElement}>
        <div className={styles.sidebar}>
          {resourceTypes.map(resourceType => (
            <PatientRecordElement
              resourceType={resourceType}
              resources={getResourcesByType(resourceType, groupedResources)}
              key={resourceType}
            />
          ))}
        </div>

        <div className={styles.recordToggle} onClick={expand}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.record}>
        <div className={styles.recordToggle} onClick={expand}>
          <FontAwesomeIcon icon={faNotesMedical} />
        </div>
      </div>
    );
  }
};

const PatientRecordElement: FC<PatientRecordElementProps> = ({ resourceType, resources }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const chevron: IconProp = isExpanded ? faChevronUp : faChevronDown;
  const resourceCount: string = !['Patient', 'Pathway', 'Mcode'].includes(resourceType)
    ? `(${resources.length})`
    : '';

  return (
    <div className={styles.element}>
      <div className={styles.title} onClick={(): void => setIsExpanded(!isExpanded)}>
        <div>
          {resourceType} {resourceCount}
        </div>
        <div className={styles.expand}>
          <FontAwesomeIcon icon={chevron} />
        </div>
      </div>

      {isExpanded && (
        <div className={styles.visualizerContainer}>
          <Visualizer resourceType={resourceType} resourcesByType={resources} />
        </div>
      )}
    </div>
  );
};

const Visualizer: FC<VisualizerProps> = ({ resourceType, resourcesByType }) => {
  const patient = usePatient().patient as fhir.Patient;

  if (resourceType === 'Pathway') return <PathwayVisualizer />;
  else if (resourceType === 'Mcode') return <McodeVisualizer />;
  else if (resourceType === 'Patient') return <PatientVisualizer patient={patient} />;
  else if (resourceType === 'Condition') return <ConditionsVisualizer rows={resourcesByType} />;
  else if (resourceType === 'Observation') return <ObservationsVisualizer rows={resourcesByType} />;
  else if (resourceType === 'DiagnosticReport') return <ReportsVisualizer rows={resourcesByType} />;
  else if (resourceType === 'MedicationRequest')
    return <MedicationsVisualizer rows={resourcesByType} />;
  else if (resourceType === 'AllergyIntolerance')
    return <AllergiesVisualizer rows={resourcesByType} />;
  else if (resourceType === 'CarePlan') return <CarePlansVisualizer rows={resourcesByType} />;
  else if (resourceType === 'Procedure') return <ProceduresVisualizer rows={resourcesByType} />;
  else if (resourceType === 'Encounter') return <EncountersVisualizer rows={resourcesByType} />;
  else if (resourceType === 'Immunization')
    return <ImmunizationsVisualizer rows={resourcesByType} />;
  else return <div>Unsupported Resource</div>;
};

const PathwayVisualizer: FC = () => {
  const { patientRecords } = usePatientRecords();
  const { evaluatedPathway } = usePathwayContext();
  const [criteria, setCriteria] = useState<CriteriaResult | null>(null);

  useEffect(() => {
    // Create a Bundle for the CQL engine and check if patientPath needs to be evaluated
    const patient = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: patientRecords.map((r: fhir.Resource) => ({ resource: r }))
    };

    // Evaluate pathway criteria
    if (evaluatedPathway) {
      evaluatePathwayCriteria(patient, evaluatedPathway.pathway).then(criteriaResult =>
        setCriteria(criteriaResult)
      );
    }
  }, [evaluatedPathway, patientRecords]);

  return (
    <table>
      <tbody>
        {criteria?.criteriaResultItems.map(c => (
          <tr key={c.elementName}>
            <td>{c.elementName}</td>
            <td>{c.actual}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const McodeVisualizer: FC = () => {
  const { mcodeRecords } = usePatientRecords();
  type mcodeKey = keyof McodeElements & string;
  const keysArray: mcodeKey[] = [];
  for (const key in mcodeRecords) {
    keysArray.push(key as mcodeKey);
  }
  return (
    <table>
      <tbody>
        {keysArray.map(key => {
          return (
            <tr key={key}>
              <td>{key}</td>
              <td>{mcodeRecords[key] ? mcodeRecords[key] : '-'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default PatientRecord;
