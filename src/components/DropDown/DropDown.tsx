import React, { FC, useCallback } from 'react';
import Select from 'react-select';

import classes from './DropDown.module.scss';
import { Option } from 'option';

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

  if (visible)
    return (
      <div className={classes.dropdown}>
        <div>
          <label htmlFor={id}>{label}</label>
          <button
            onClick={(): void => {
              setSelectPathway(true);
            }}
          >
            Explore Pathways
          </button>
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
