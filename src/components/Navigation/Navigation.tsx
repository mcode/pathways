import React, { FC } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

import PatientSnapshot from 'components/PatientSnapshot';
import DropDown from 'components/DropDown';
import styles from './Navigation.module.scss';
import { EvaluatedPathway } from 'pathways-model';
import { Option } from 'option';
import { usePathwayContext } from 'components/PathwayProvider';

const useStyles = makeStyles(
  theme => ({
    navigation: {
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary
    }
  }),
  { name: 'Navigation' }
);

interface Props {
  evaluatedPathways: EvaluatedPathway[];
  selectPathway: boolean;
  setSelectPathway: (flag: boolean) => void;
  onBack?: () => void;
}

const Navigation: FC<Props> = ({ evaluatedPathways, selectPathway, setSelectPathway, onBack }) => {
  const classes = useStyles();
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
    <nav className={clsx(styles.navigation, classes.navigation)}>
      <div className={styles.navigation__leftPanel}>
        {onBack && (
          <FontAwesomeIcon
            icon={faChevronLeft}
            className={styles.navigation__back}
            onClick={onBack}
          />
        )}

        <PatientSnapshot />
      </div>

      <div className={styles.navigation__rightPanel}>
        <DropDown
          label="Pathway:"
          id="patient-view"
          visible={!selectPathway}
          options={pathwayOptions}
          selectedValue={value}
          evaluatedPathways={evaluatedPathways}
          setSelectPathway={setSelectPathway}
          onChange={onChangeHandler}
        />
      </div>
    </nav>
  );
};

export default Navigation;
