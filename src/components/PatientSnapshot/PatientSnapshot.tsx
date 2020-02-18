import React, { FC, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { usePatient } from '../PatientProvider';

import styles from './PatientSnapshot.module.scss';

const getPatientName = (name: Array<fhir.HumanName> = []): string => {
  const entry = name.find(n => n.use === 'official') || name[0];
  return entry ? `${(entry.given || []).join(' ')} ${entry.family}` : 'No name';
};

const getPatientAddress = (address: Array<fhir.Address> = []): string => {
  const entry = address[0];
  return entry ? [entry.city, entry.state].filter(item => !!item).join(', ') : 'No Address';
};

const PatientSnapshot: FC<{}> = () => {
  const patient = usePatient();

  const name = useMemo(() => getPatientName(patient.name), [patient]);
  const address = useMemo(() => getPatientAddress(patient.address), [patient]);

  return (
    <div className={styles.patientSnapshot}>
      <FontAwesomeIcon icon="user-circle" className={styles.patientSnapshot__photo} />

      <div className={styles.patientSnapshot__info}>
        <div className={styles.patientName}>{name}</div>

        <ul className={styles.patientSnapshot__list}>
          <li>DOB: {patient.birthDate}</li>
          <li>Admin. Sex: {patient.gender}</li>
          <li>Location: {address}</li>
        </ul>
      </div>
    </div>
  );
};

export default PatientSnapshot;
