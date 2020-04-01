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

const getResourceByType = (
  patientRecord: ReadonlyArray<DomainResource>,
  resourceType: string
): ReadonlyArray<object> => {
  return patientRecord.filter(resource => resource.resourceType === resourceType);
};

interface PatientRecordProps {
  headerElement: RefObject<HTMLDivElement>;
}

interface PatientRecordElementProps {
  resourceType: string;
}

interface VisualizerProps {
  resourceType: string;
  resourcesByType: readonly object[];
}

const PatientRecord: FC<PatientRecordProps> = ({ headerElement }) => {
  const recordContainerElement = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const resourceTypes = [
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
            <PatientRecordElement resourceType={resourceType} key={resourceType} />
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

const PatientRecordElement: FC<PatientRecordElementProps> = ({ resourceType }) => {
  const resources = usePatientRecords().patientRecords;
  const resourcesByType = getResourceByType(resources, resourceType);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const chevron: IconProp = isExpanded ? faChevronUp : faChevronDown;
  const resourceCount: string =
    resourceType !== 'Patient' ? '(' + resourcesByType.length + ')' : '';

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
        <div className={styles.elementContainer}>
          <Visualizer resourceType={resourceType} resourcesByType={resourcesByType} />
        </div>
      )}
    </div>
  );
};

const Visualizer: FC<VisualizerProps> = ({ resourceType, resourcesByType }) => {
  const patient = usePatient();
  if (resourceType === 'Patient') return <PatientVisualizer patient={patient} />;
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

export default PatientRecord;
