import React, { FC, ReactElement } from 'react';
import { Popup, StrictPopupProps } from 'semantic-ui-react';
import styles from './PathwayPopup.module.scss';
import { classNames } from 'react-select/src/utils';

interface PathwayPopupProps {
  Content: ReactElement;
  Trigger: ReactElement;
  popupPosition: StrictPopupProps['position'];
  className?: string;
}

const PathwayPopup: FC<PathwayPopupProps> = ({
  Content,
  Trigger,
  popupPosition,
  className
}: PathwayPopupProps) => {
  return (
    <Popup
      content={Content}
      position={popupPosition || 'bottom center'}
      className={`${styles.pathwayPopup} ${className}`}
      on="click"
      pinned
      trigger={Trigger}
    />
  );
};

export default PathwayPopup;
