import React, { FC, ReactElement } from 'react';
import { Popup, StrictPopupProps } from 'semantic-ui-react';
import styles from './PathwayPopup.module.scss';

interface PathwayPopupProps {
  Content: ReactElement;
  Trigger: ReactElement;
  popupPosition: StrictPopupProps['position'];
}
// const PathwayPopup: FC<PathwayPopupProps> = ({ name }) => {
//   return (
//     <Popup
//       content={<PopupContent values={['N1', 'N0', 'N+']}></PopupContent>}
//       position="bottom right"
//       className={classes.pathwayPopup}
//       on="click"
//       pinned
//       trigger={
//         <div className={classes.popupWrapper}>
//           missing data
//           <FontAwesomeIcon icon="edit" className={nodeClasses.externalLink} />
//         </div>
//       }
//     />
//   );
// };

const PathwayPopup: FC<PathwayPopupProps> = ({
  Content,
  Trigger,
  popupPosition
}: PathwayPopupProps) => {
  return (
    <Popup
      content={Content}
      position={popupPosition || 'bottom center'}
      className={styles.pathwayPopup}
      on="click"
      pinned
      trigger={Trigger}
    />
  );
};

export default PathwayPopup;
