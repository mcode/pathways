import React, { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import PatientSnapshot from 'components/PatientSnapshot';
import DropDown from 'components/DropDown';

import classes from './Navigation.module.scss';
import { PatientPathway } from 'pathways-model';
import { Option } from 'option';
import { usePathwayContext } from 'components/PathwayProvider';

interface Props {
  patientPathwayList: PatientPathway[];
  selectPathway: boolean;
  setSelectPathway: (flag: boolean) => void;
}

const Navigation: FC<Props> = ({ patientPathwayList, selectPathway, setSelectPathway }) => {
  const pathwayCtx = usePathwayContext();
  const pathway = pathwayCtx.patientPathway?.pathway;
  const value =
    pathway === undefined ? null : { label: pathway.name, value: pathwayCtx.patientPathway };

  const onChangeHandler = (pathwayOption: Option | ReadonlyArray<Option> | null): void => {
    if (pathwayOption !== null && 'value' in pathwayOption) {
      pathwayCtx.setPatientPathway(pathwayOption.value);
    }
  };

  const pathwayOptions = patientPathwayList.map(patientPathway => ({
    label: patientPathway.pathway.name,
    value: patientPathway
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
