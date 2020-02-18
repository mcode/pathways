import React, { FC } from 'react';
import indexStyles from 'styles/index.module.scss';
import styles from './ActionButton.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface ButtonProps {
  type: 'accept' | 'decline';
  onClick?: () => void;
}

interface ActionButtonProps extends ButtonProps {
  size: 'small' | 'large';
}

const LargeActionButton: FC<ButtonProps> = ({ type, onClick }) => {
  return (
    <button
      className={`${styles.largeActionButton} ${indexStyles.button} ${type === 'decline' &&
        styles.largeDecline}`}
      type="button"
      onClick={onClick}
    >
      {type[0].toUpperCase() + type.slice(1)}
    </button>
  );
};

const SmallActionButton: FC<ButtonProps> = ({ type, onClick }) => {
  return (
    <div
      className={type === 'accept' ? styles.accept : styles.decline}
      onClick={onClick}
      data-testid={type}
    >
      <FontAwesomeIcon icon={type === 'accept' ? 'check' : 'times'} />
    </div>
  );
};

const ActionButton: FC<ActionButtonProps> = ({ type, size, onClick }) => {
  switch (size) {
    case 'small':
      return <SmallActionButton type={type} onClick={onClick} />;
    case 'large':
      return <LargeActionButton type={type} onClick={onClick} />;
  }
};

export default ActionButton;
