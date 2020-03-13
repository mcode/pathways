import React, { FC } from 'react';
import { useNote } from 'components/NoteDataProvider';
import ReportSection, { PhysicianNotesSection } from './ReportSection';
import styles from './ReportModal.module.scss';
import { faUser, faNotesMedical, faRoute, faStickyNote } from '@fortawesome/free-solid-svg-icons';

const ReportModal: FC = () => {
  const note = useNote();
  const reportName = `${note?.pathway} Report`;
  const patientSection = [
    { name: 'Date:', value: note?.date },
    { name: 'Patient', value: note?.patient },
    { name: 'Date of Birth:', value: note?.birthdate} ,
    { name: 'Physician:', value: note?.physician }
  ];
  const observationField = [
    { name: 'Primary Cancer:', value: 'Intraductal Cance of the Breast'},
    { name: 'Laterality:', value: 'Right' },
    { name: 'Clinical TNM:', value: 'cT1 N0 M0' },
    { name: 'Estrogen Receptor', value: 'Positive' },
    { name: 'Progesterone Receptor', value: 'Negative' },
    { name: 'HER2 Receptor', value: 'Postive' }
  ];
  const pathwaySection = [
    { name: 'Pathway Selected', value: note?.pathway },
    { name: 'Recommendation', value: note?.node },
    { name: 'Pathway Status', value: note?.status }
  ];
  return (
    <div className={styles.reportModal}>
      <h1>{reportName}</h1>
      <ReportSection icon={faUser} fields={patientSection} />
      <ReportSection icon={faNotesMedical} fields={observationField} />
      <ReportSection icon={faRoute} fields={pathwaySection} />
      {note?.notes && <PhysicianNotesSection icon={faStickyNote} notes={note?.notes} />}
    </div>
  );
};

export default ReportModal;
