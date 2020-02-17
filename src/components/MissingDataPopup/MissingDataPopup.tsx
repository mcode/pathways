import React, { FC, useState } from 'react';
import styles from './MissingDataPopup.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import PathwayPopup from '../PathwayPopup/PathwayPopup';
import nodeClasses from '../ExpandedNode/ExpandedNode.module.scss';
import classes from '*.module.css';

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
        <div className={styles.popupWrapper}>
          missing data
          <FontAwesomeIcon icon="edit" className={nodeClasses.externalLink} />
        </div>
      }
      popupPosition="bottom right"
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
  const [showCheck, setShowCheck] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>('');
  return (
    <div>
      <div className={classes.popupContent}>
        Select Value:
        <div>
          {values.map(e => {
            return (
              <div
                key={e}
                className={classes.popupChoice + ' ' + (selected === e ? classes.selected : '')}
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
      <div className={classes.footer}>
        <div
          className={classes.times}
          onClick={(): void => {
            setOpen(false);
          }}
        >
          <FontAwesomeIcon icon={faTimes} />
        </div>
        {showCheck && (
          <div
            className={classes.check}
            onClick={(): void => {
              setOpen(false);
              // TODO: callback for using selected value
              // can go here
            }}
          >
            <FontAwesomeIcon icon={faCheck} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MissingDataPopup;
