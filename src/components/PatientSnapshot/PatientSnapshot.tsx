import React, { FC, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { HumanName, Address } from 'fhir-objects';

import { usePatient } from '../PatientProvider';
import styles from './PatientSnapshot.module.scss';

const useStyles = makeStyles(
  theme => ({
    'patient-snapshot-list': {
      color: theme.palette.text.primary
    }
  }),
  { name: 'PatientSnapshot' }
);

const getPatientName = (name: Array<HumanName> = []): string => {
  const entry = name.find(n => n.use === 'official') || name[0];
  return entry ? `${(entry.given || []).join(' ')} ${entry.family}` : 'No name';
};

const getPatientAge = (birthDateString: string | undefined): number => {
  if (!birthDateString) return 0;
  const today = new Date();
  const birthDate = new Date(birthDateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const getPatientAddress = (address: Array<Address> = []): string => {
  const entry = address[0];
  return entry ? [entry.city, entry.state].filter(item => !!item).join(', ') : 'No Address';
};

const PatientSnapshot: FC<{}> = () => {
  const classes = useStyles();
  const patient = usePatient().patient as fhir.Patient;
  const name = useMemo(() => getPatientName(patient.name), [patient]);
  const address = useMemo(() => getPatientAddress(patient.address), [patient]);
  const age = useMemo(() => getPatientAge(patient.birthDate), [patient]);

  return (
    <div className={styles.patientSnapshot}>
      <FontAwesomeIcon icon={faUserCircle} className={styles.patientSnapshot__photo} />

      <div className={styles.patientSnapshot__info}>
        <div className={styles.patientName}>{name}</div>

        <ul className={clsx(styles.patientSnapshot__list, classes['patient-snapshot-list'])}>
          <li>
            DOB: {patient.birthDate} (Age: {age})
          </li>
          <li>Admin. Sex: {patient.gender}</li>
          <li>Location: {address}</li>
        </ul>
      </div>
    </div>
  );
};

export default PatientSnapshot;
