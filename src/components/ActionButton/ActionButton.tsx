import React, { FC } from 'react';
import styles from './ActionButton.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@material-ui/core';

interface ButtonProps {
  type: 'accept' | 'decline';
  onClick?: () => void;
}

interface ActionButtonProps extends ButtonProps {
  size: 'small' | 'large' | 'medium';
}

const LargeActionButton: FC<ButtonProps> = ({ type, onClick }) => {
  return (
    <Button
      onClick={onClick}
      variant={type === 'decline' ? 'text' : 'contained'}
      color={type === 'decline' ? 'secondary' : 'primary'}
    >
      {type[0].toUpperCase() + type.slice(1)}
    </Button>
  );
};

const SmallActionButton: FC<ButtonProps> = ({ type, onClick }) => {
  return (
    <div
      className={`${type === 'accept' ? styles.accept : styles.decline} ${
        styles.smallActionButton
      }`}
      onClick={onClick}
      data-testid={type}
    >
      <FontAwesomeIcon icon={type === 'accept' ? faCheck : faTimes} />
    </div>
  );
};

const MediumActionButton: FC<ButtonProps> = ({ type, onClick }) => {
  const buttonText = {
    accept: 'Submit',
    decline: 'Cancel'
  };
  return (
    <div
      className={`${type === 'accept' ? styles.accept : styles.decline} ${
        styles.mediumActionButton
      }`}
      onClick={onClick}
      data-testid={type}
    >
      <FontAwesomeIcon icon={type === 'accept' ? faCheck : faTimes} />
      {buttonText[type]}
    </div>
  );
};

const ActionButton: FC<ActionButtonProps> = ({ type, size, onClick }) => {
  switch (size) {
    case 'small':
      return <SmallActionButton type={type} onClick={onClick} />;
    case 'large':
      return <LargeActionButton type={type} onClick={onClick} />;
    case 'medium':
      return <MediumActionButton type={type} onClick={onClick} />;
  }
};

export default ActionButton;
