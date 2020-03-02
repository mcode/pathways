import React, { FC, useState } from 'react';
import styles from './MissingDataPopup.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PathwayPopup from 'components/PathwayPopup';
import ActionButton from 'components/ActionButton';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { usePatient } from 'components/PatientProvider';
import { usePatientRecords } from 'components/PatientRecordsProvider';
import { useFHIRClient } from 'components/FHIRClient';

interface MissingDataPopup {
  values: string[];
}

const MissingDataPopup: FC<MissingDataPopup> = ({ values }) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <PathwayPopup
      Content={<PopupContent values={values} setOpen={setOpen}></PopupContent>}
      className={styles.missingDataPopup}
      Trigger={
        <div className={styles.popupTrigger}>
          missing data
          <FontAwesomeIcon icon={faEdit} className={styles.externalLink} />
        </div>
      }
      open={open}
      setOpen={setOpen}
    />
  );
};

interface PopupContentProps {
  values: Array<string>;
  setOpen: Function;
}

const PopupContent: FC<PopupContentProps> = ({ values, setOpen }) => {
  const patient = usePatient();
  const client = useFHIRClient();
  const { patientRecords, setPatientRecords } = usePatientRecords();
  const [showCheck, setShowCheck] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>('');
  return (
    <div>
      <div className={styles.popupContent}>
        Select Value:
        <div>
          {values.map(e => {
            return (
              <div
                key={e}
                className={styles.popupChoice + ' ' + (selected === e ? styles.selected : '')}
                onClick={(): void => {
                  if (showCheck && selected === e) {
                    setShowCheck(false);
                    setSelected('');
                  } else {
                    setShowCheck(true);
                    setSelected(e);
                  }
                }}
              >
                {e}
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.footer}>
        <ActionButton size="small" type="decline" onClick={(): void => setOpen(false)} />
        {showCheck && (
          <ActionButton
            size="small"
            type="accept"
            onClick={(): void => {
              setOpen(false);
              const note = createDocumentReference(selected, patient);
              setPatientRecords([...patientRecords, note]);
              client?.create?.(note);
            }}
          />
        )}
      </div>
    </div>
  );
};

const createDocumentReference = (selected: string, patient: fhir.Patient): object => {
  return {
    resourceType: 'DocumentReference',
    id: btoa(selected), // Work around for typescript accessing the data
    status: 'current',
    subject: 'Patient/' + patient.id,
    context: { encounter: 'Encounter/1' },
    content: {
      attachement: {
        data: btoa(selected), // Base 64 encoded data
        contentType: 'text/plain'
      }
    }
  };
};

export default MissingDataPopup;
