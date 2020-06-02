import React, { FC, useCallback } from 'react';
import Select from 'react-select';

import styles from './DropDown.module.scss';
import { Option } from 'option';
import { createCarePlan } from 'utils/fhirUtils';
import { Button } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThList, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

interface Props {
  label?: string;
  id: string;
  visible: boolean;
  options: Array<Option>;
  onChange?: (value: Option | ReadonlyArray<Option> | null) => void;
  selectedValue: Option | ReadonlyArray<Option> | null;
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
  const onChangeCallback = useCallback(
    (value: Option | ReadonlyArray<Option> | null | undefined) => {
      if (onChange) onChange(value == null ? null : value);
    },
    [onChange]
  );

  const selected = true;

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
              // if (selected) {
              //   // Unassign
              // } else {
              //   const carePlan = createCarePlan(pathway.name, patient);
              //   setPatientRecords([...patientRecords, carePlan]);
              //   client?.create?.(carePlan);
              // }
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
