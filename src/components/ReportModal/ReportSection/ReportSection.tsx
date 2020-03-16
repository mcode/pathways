import React, { FC, ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import styles from './ReportSection.module.scss';

interface ReportSectionProps {
  icon: IconDefinition;
  fields: { name: ReactNode; value: ReactNode }[];
}

const ReportSection: FC<ReportSectionProps> = ({ icon, fields }) => {
  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionIconContainer}>
        <FontAwesomeIcon icon={icon} className={styles.icon} />
      </div>
      <div className={styles.fieldContainer}>
        {fields.map(field => (
          <ReportField sectionTitle={field.name} value={field.value} />
        ))}
      </div>
    </div>
  );
};

interface ReportFieldProps {
  sectionTitle: ReactNode;
  value: ReactNode;
}

const ReportField: FC<ReportFieldProps> = ({ sectionTitle, value }) => {
  return (
    <div className={styles.field}>
      <b>{sectionTitle}: </b>
      <span>{value}</span>
    </div>
  );
};

interface PhysicianNotesProps {
  icon: IconDefinition;
  notes: string;
}

const PhysicianNotesSection: FC<PhysicianNotesProps> = ({ icon, notes }) => {
  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionIconContainer}>
        <FontAwesomeIcon icon={icon} className={styles.icon} />
      </div>
      <div className={styles.field}>
        <b>Physician Notes: </b>
        <span>notes</span>
      </div>
    </div>
  );
};

export { PhysicianNotesSection };
export default ReportSection;
