import React, { FC, useCallback, useState } from 'react';
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
  const [value, setValue] = useState<Option | ReadonlyArray<Option> | null>(selectedValue);

  const onChangeCallback = useCallback(
    (value: Option | ReadonlyArray<Option> | null | undefined) => {
      if (value !== undefined) setValue(value);
      if (onChange) onChange(value == null ? null : value);
    },
    [onChange]
  );

  const hiddenClass = visible ? '' : classes.hidden;

  return (
    <div className={`${classes.dropdown} ${hiddenClass}`}>
      <div>
        <label htmlFor={id}>{label}</label>
        <button
          onClick={() => {
            setSelectPathway(true);
          }}
        >
          Explore Pathways
        </button>
      </div>
      <Select
        classNamePrefix="DropDown"
        inputId={id}
        value={value === null ? selectedValue : value}
        onChange={onChangeCallback}
        options={options}
        aria-label={label}
      />
    </div>
  );
};

export default DropDown;
