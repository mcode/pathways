import React, { FC } from 'react';
import styles from './withConfirmationPopup.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import PathwayPopup from 'components/PathwayPopup';

const withConfirmationPopup = <T extends object>(WrappedComponent: FC<T>): FC<T> => {
  const PopupComponent: FC<T> = (props: T) => {
    // https://github.com/Semantic-Org/Semantic-UI-React/issues/2487
    return (
      <PathwayPopup
        className={styles.withConfirmationPopup}
        Content={<PopupContent />}
        Trigger={
          <div className={styles.triggerContainer} {...props}>
            <WrappedComponent {...props} />
          </div>
        }
        popupPosition="bottom right"
      />
    );
  };
  return PopupComponent;
};

const PopupContent: FC = () => {
  return (
    <div className={styles.popupContent}>
      <div>Are you sure?</div>
      <div>
        <div className={styles.selectButton}>
          <FontAwesomeIcon icon={faCheck} />
        </div>
        <div className={styles.selectButton}>
          <FontAwesomeIcon icon={faTimes} />
        </div>
      </div>
    </div>
  );
};

export default withConfirmationPopup;
