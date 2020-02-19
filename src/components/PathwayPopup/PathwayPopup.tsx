import React, { FC, ReactElement } from 'react';
import { Popup, StrictPopupProps } from 'semantic-ui-react';
import styles from './PathwayPopup.module.scss';

interface PathwayPopupProps {
  Content: ReactElement;
  Trigger: ReactElement;
  popupPosition?: StrictPopupProps['position'];
  open?: boolean;
  setOpen?: Function;
  className?: string;
}

const PathwayPopup: FC<PathwayPopupProps> = ({
  Content,
  Trigger,
  popupPosition,
  open,
  setOpen,
  className
}: PathwayPopupProps) => {
  return (
    <Popup
      content={Content}
      position={popupPosition || 'bottom right'}
      className={`${styles.pathwayPopup} ${className}`}
      on="click"
      open={open}
      onOpen={(): void => {
        setOpen && setOpen(true);
      }}
      onClose={(): void => {
        setOpen && setOpen(false);
      }}
      pinned
      trigger={Trigger}
    />
  );
};

export default PathwayPopup;
