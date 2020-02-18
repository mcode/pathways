import React, { FC } from 'react';
import styles from './withConfirmationPopup.module.scss';
import PathwayPopup from 'components/PathwayPopup';
import ActionButton from 'components/ActionButton';

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
        <ActionButton size="small" type="accept" />
        <ActionButton size="small" type="decline" />
      </div>
    </div>
  );
};

export default withConfirmationPopup;
