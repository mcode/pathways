import React, { FC } from 'react';
import styles from './withConfirmationPopup.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import PathwayPopup from '../PathwayPopup/PathwayPopup';

const withConfirmationPopup = <T extends object>(WrappedComponent: FC<T>): FC<T> => {
  const PopupComponent: FC<T> = (props: T) => {
    // https://github.com/Semantic-Org/Semantic-UI-React/issues/2487
    return (
      <PathwayPopup
        Content={<PopupContent />}
        Trigger={
          <div className={styles.triggerContainer} {...props}>
            <WrappedComponent {...props} />
          </div>
        }
        popupPosition="bottom center"
      />
    );
  };

  return PopupComponent;
};

const PopupContent: FC = () => {
  return (
    <div>
      <div className={styles.footer}>
        <FontAwesomeIcon icon={faCheck} />
      </div>
      <div className={styles.footer}>
        <FontAwesomeIcon icon={faTimes} />
      </div>
    </div>
  );
};

export default withConfirmationPopup;
