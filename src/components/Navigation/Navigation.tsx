import React, { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import PatientSnapshot from 'components/PatientSnapshot';
import DropDown from 'components/DropDown';

import classes from './Navigation.module.scss';
import { EvaluatedPathway } from 'pathways-model';
import { Option } from 'option';
import { usePathwayContext } from 'components/PathwayProvider';

interface Props {
  evaluatedPathways: EvaluatedPathway[];
  selectPathway: boolean;
  setSelectPathway: (flag: boolean) => void;
}

const Navigation: FC<Props> = ({ evaluatedPathways, selectPathway, setSelectPathway }) => {
  const pathwayCtx = usePathwayContext();
  const pathway = pathwayCtx.evaluatedPathway?.pathway;
  const value =
    pathway === undefined ? null : { label: pathway.name, value: pathwayCtx.evaluatedPathway };

  const onChangeHandler = (pathwayOption: Option | ReadonlyArray<Option> | null): void => {
    if (pathwayOption !== null && 'value' in pathwayOption) {
      pathwayCtx.setEvaluatedPathway(pathwayOption.value);
    }
  };

  const pathwayOptions = evaluatedPathways.map(evaluatedPathway => ({
    label: evaluatedPathway.pathway.name,
    value: evaluatedPathway
  }));

  return (
    <nav className={classes.navigation}>
      <div className={classes['navigation__left-panel']}>
        <FontAwesomeIcon icon="chevron-left" className={classes.navigation__back} />
        <PatientSnapshot />
      </div>

      <div className={classes['navigation__right-panel']}>
        <DropDown
          label="Pathway:"
          id="patient-view"
          visible={!selectPathway}
          options={pathwayOptions}
          selectedValue={value}
          setSelectPathway={setSelectPathway}
          onChange={onChangeHandler}
        />
      </div>
    </nav>
  );
};

export default Navigation;
