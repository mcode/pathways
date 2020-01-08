import React, { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import PatientSnapshot from 'components/PatientSnapshot';
import DropDown from 'components/DropDown';

import classes from './Navigation.module.scss';
import { Service } from 'pathways-objects';
import { Pathway } from 'pathways-model';
import { Option } from 'option';
import { usePathwayContext } from 'components/PathwayProvider';

interface Props {
  selectPathway: boolean;
  service: Service<Array<Pathway>>;
  setSelectPathway: (flag: boolean) => void;
}

const Navigation: FC<Props> = ({ service, selectPathway, setSelectPathway }) => {
  const pathway = usePathwayContext();
  const value =
    pathway.pathway === null ? null : { label: pathway.pathway.name, value: pathway.pathway };

  const onChangeHandler = (pathwayOption: Option | ReadonlyArray<Option> | null): void => {
    if (pathwayOption !== null && 'value' in pathwayOption) {
      pathway.setPathway(pathwayOption.value);
    }
  };

  const pathwayOptions =
    service.status !== 'loaded'
      ? []
      : service.payload.map(pathway => ({ label: pathway.name, value: pathway }));

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
