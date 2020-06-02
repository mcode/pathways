import React, { FC, useCallback } from 'react';
import Select from 'react-select';

import styles from './DropDown.module.scss';
import { Option } from 'option';
import { pathwayIsSelected } from 'utils/fhirUtils';
import { usePatientRecords } from 'components/PatientRecordsProvider';
import { Button } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThList, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { usePathwayContext } from 'components/PathwayProvider';
import { EvaluatedPathway } from 'pathways-model';

interface Props {
  label?: string;
  id: string;
  visible: boolean;
  options: Array<Option>;
  onChange?: (value: Option | ReadonlyArray<Option> | null) => void;
  selectedValue: Option | ReadonlyArray<Option> | null;
  evaluatedPathways: EvaluatedPathway[];
  setSelectPathway: (flag: boolean) => void;
}

const DropDown: FC<Props> = ({
  options,
  label,
  id,
  visible,
  onChange,
  selectedValue,
  setSelectPathway
}: Props) => {
  const { patientRecords } = usePatientRecords();
  const { evaluatedPathway, assignPathway, unassignPathway } = usePathwayContext();
  const onChangeCallback = useCallback(
    (value: Option | ReadonlyArray<Option> | null | undefined) => {
      if (onChange) onChange(value == null ? null : value);
    },
    [onChange]
  );

  const selected = pathwayIsSelected(patientRecords, evaluatedPathway?.pathway);

  if (visible)
    return (
      <div className={styles.dropdown}>
        <div>
          <label htmlFor={id}>{label}</label>
          <Button
            onClick={(): void => {
              setSelectPathway(true);
            }}
            variant="contained"
            color="primary"
            startIcon={<FontAwesomeIcon icon={faThList} />}
          >
            Explore
          </Button>
          <Button
            onClick={(): void => {
              if (evaluatedPathway?.pathway) {
                if (selected) unassignPathway(evaluatedPathway.pathway.name);
                else assignPathway(evaluatedPathway.pathway.name);
              } else {
                alert('Unable to perform action. No pathway is selected.');
              }
            }}
            variant="contained"
            color={selected ? 'secondary' : 'primary'}
            startIcon={
              selected ? (
                <FontAwesomeIcon icon={faTimesCircle} />
              ) : (
                <FontAwesomeIcon icon={faCheckCircle} />
              )
            }
          >
            {selected ? 'Unassign' : 'Assign'}
          </Button>
        </div>
        <Select
          classNamePrefix="DropDown"
          inputId={id}
          value={selectedValue}
          onChange={onChangeCallback}
          options={options}
          aria-label={label}
        />
      </div>
    );
  else return <div></div>;
};

export default DropDown;
