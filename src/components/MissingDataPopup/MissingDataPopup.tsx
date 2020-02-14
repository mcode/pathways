import React, { FC } from 'react';
import styles from './MissingDataPopup.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import PathwayPopup from '../PathwayPopup/PathwayPopup';
import nodeClasses from '../ExpandedNode/ExpandedNode.module.scss';

interface MissingDataPopup {
  values: string[];
}

const MissingDataPopup: FC<MissingDataPopup> = ({ values}) => {
  return (
    <PathwayPopup
      Content={<PopupContent values={values}></PopupContent>}
      Trigger={
        <div className={styles.popupWrapper}>
          missing data
          <FontAwesomeIcon icon="edit" className={nodeClasses.externalLink} />
        </div>
      }
      popupPosition="bottom right"
    />
  );
};

interface PopupContentProps {
  values: Array<string>;
}

const PopupContent: FC<PopupContentProps> = ({ values }) => {
  return (
    <div>
      <div className={styles.popupContent}>
        Select Value:
        <div>
          {values.map(e => {
            return <div className={styles.popupChoice}>{e}</div>;
          })}
        </div>
      </div>
      <div className={styles.footer}>
        <FontAwesomeIcon icon={faTimes} />
      </div>
    </div>
  );
};

export default MissingDataPopup;
