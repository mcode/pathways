import React, { FC } from 'react';
import { useNote } from 'components/NoteDataProvider';
import ReportSection, { PhysicianNotesSection } from './ReportSection';
import styles from './ReportModal.module.scss';
import { faUser, faNotesMedical, faRoute, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import ActionButton from 'components/ActionButton';
import { usePatientRecords } from 'components/PatientRecordsProvider';
import { getTNM } from 'utils/fhirUtils';

interface ReportModalInterface {
  onConfirm: () => void;
  onDecline: () => void;
}

const ReportModal: FC<ReportModalInterface> = ({ onConfirm, onDecline }) => {
  const { note } = useNote();
  const { mcodeRecords } = usePatientRecords();
  const reportName = 'Pathway Report';
  const patientSection = [
    { name: 'Date', value: note?.date },
    { name: 'Patient', value: note?.patient },
    { name: 'Date of Birth', value: note?.birthdate },
    { name: 'Physician', value: note?.physician }
  ];

  const observationField = [
    { name: 'Primary Cancer', value: mcodeRecords.primaryCancer ?? 'Unknown' },
    { name: 'Laterality', value: mcodeRecords.laterality ?? 'Unknown' },
    { name: 'Clinical TNM', value: getTNM(mcodeRecords) },
    { name: 'Estrogen Receptor', value: mcodeRecords.estrogenReceptor ?? 'Unknown' },
    { name: 'Progesterone Receptor', value: mcodeRecords.progesteroneReceptor ?? 'Unknown' },
    { name: 'HER2 Receptor', value: mcodeRecords.her2Receptor ?? 'Unknown' }
  ];

  const pathwaySection = [
    { name: 'Pathway Selected', value: note?.pathway },
    { name: 'Recommendation', value: note?.node },
    { name: 'Pathway Status', value: note?.status }
  ];
  return (
    <div className={styles.reportModal}>
      <h1>{reportName}</h1>
      <div className={styles.sectionContainer}>
        <ReportSection icon={faUser} fields={patientSection} />
        <ReportSection icon={faNotesMedical} fields={observationField} />
        <ReportSection icon={faRoute} fields={pathwaySection} />
        {note?.notes && <PhysicianNotesSection icon={faStickyNote} notes={note?.notes} />}
      </div>
      <div className={styles.confirmationSection}>
        <i>
          The above note will be written into the EHR and any procedure requests will be submitted.
        </i>
        <div className={styles.confirmationButtonGroup}>
          <ActionButton size="medium" type="accept" onClick={onConfirm} />
          <ActionButton size="medium" type="decline" onClick={onDecline} />
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
