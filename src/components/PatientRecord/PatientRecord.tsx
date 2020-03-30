import React, { FC, useState, useEffect } from 'react';
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

interface PatientRecordElementProps {
  resourceType: string;
}

const PatientRecord: FC = () => {
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
    const recordContainer = document.getElementById('recordContainer');
    const headerHeight = document.getElementById('header')?.clientHeight;
    const navHeight = document.getElementById('navigation')?.clientHeight;
    console.log(recordContainer);
    if (recordContainer && navHeight && headerHeight)
      recordContainer.style.height = window.innerHeight - (navHeight + headerHeight) + 'px';
  }, [isExpanded]);

  if (isExpanded) {
    return (
      <div className={styles.record} id="recordContainer">
        <div className={styles.sidebar}>
          {resourceTypes.map(resourceType => (
            <PatientRecordElement resourceType={resourceType} />
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
  const patient = usePatient();
  const resources = usePatientRecords().patientRecords;
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const chevron: IconProp = isExpanded ? faChevronUp : faChevronDown;

  const visualizer = (resourceType: string): JSX.Element | undefined => {
    resourceType = resourceType.toLowerCase();
    if (resourceType === 'patient') return <PatientVisualizer patient={patient} />;
    else if (resourceType === 'condition')
      return <ConditionsVisualizer rows={getResourceByType(resources, 'Condition')} />;
    else if (resourceType === 'observation')
      return <ObservationsVisualizer rows={getResourceByType(resources, 'Observation')} />;
    else if (resourceType === 'diagnosticreport')
      return <ReportsVisualizer rows={getResourceByType(resources, 'DiagnosticReport')} />;
    else if (resourceType === 'medicationrequest')
      return <MedicationsVisualizer rows={getResourceByType(resources, 'MedicationRequest')} />;
    else if (resourceType === 'allergyintolerance')
      return <AllergiesVisualizer rows={getResourceByType(resources, 'AllergyIntolerance')} />;
    else if (resourceType === 'careplan')
      return <CarePlansVisualizer rows={getResourceByType(resources, 'CarePlan')} />;
    else if (resourceType === 'procedure')
      return <ProceduresVisualizer rows={getResourceByType(resources, 'Procedure')} />;
    else if (resourceType === 'encounter')
      return <EncountersVisualizer rows={getResourceByType(resources, 'Encounter')} />;
    else if (resourceType === 'immunization')
      return <ImmunizationsVisualizer rows={getResourceByType(resources, 'Immunization')} />;
  };

  return (
    <div className={styles.element}>
      <div className={styles.title} onClick={(): void => setIsExpanded(!isExpanded)}>
        <div>{resourceType}</div>
        <div className={styles.expand}>
          <FontAwesomeIcon icon={chevron} />
        </div>
      </div>

      {isExpanded && <div className={styles.elementContainer}>{visualizer(resourceType)}</div>}
    </div>
  );
};

export default PatientRecord;
