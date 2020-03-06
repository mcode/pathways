import React, { FC } from 'react';
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

const getResourceByType = (
  patientRecord: ReadonlyArray<fhir.DomainResource>,
  resourceType: string
): ReadonlyArray<object> => {
  return patientRecord.filter(resource => resource.resourceType === resourceType);
};

const PatientRecord: FC = () => {
  const patient = usePatient();
  const resources = usePatientRecords().patientRecords;

  return (
    <div>
      <PatientVisualizer patient={patient} />
      <ConditionsVisualizer rows={getResourceByType(resources, 'Condition')} />
      <ObservationsVisualizer rows={getResourceByType(resources, 'Observation')} />
      <ReportsVisualizer rows={getResourceByType(resources, 'DiagnosticReport')} />
      <MedicationsVisualizer rows={getResourceByType(resources, 'MedicationRequest')} />
      <AllergiesVisualizer rows={getResourceByType(resources, 'AllergyIntolerance')} />
      <CarePlansVisualizer rows={getResourceByType(resources, 'CarePlan')} />
      <ProceduresVisualizer rows={getResourceByType(resources, 'Procedure')} />
      <EncountersVisualizer rows={getResourceByType(resources, 'Encounter')} />
      <ImmunizationsVisualizer rows={getResourceByType(resources, 'Immunization')} />
    </div>
  );
};

export default PatientRecord;
