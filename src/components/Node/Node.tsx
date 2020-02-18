import React, { FC, Ref, forwardRef } from 'react';
import { GuidanceState, State, DocumentationResource } from 'pathways-model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import styles from './Node.module.scss';
import nodeStyles from 'styles/index.module.scss';
import ExpandedNode from 'components/ExpandedNode';
import { isGuidanceState } from 'utils/nodeUtils';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface NodeProps {
  pathwayState: State;
  documentation: DocumentationResource | undefined;
  isOnPatientPath: boolean;
  isCurrentNode: boolean;
  xCoordinate: number;
  yCoordinate: number;
  expanded?: boolean;
  onClickHandler?: () => void;
}

interface NodeIconProps {
  pathwayState: State;
  isGuidance: boolean;
}

const Node: FC<NodeProps & { ref: Ref<HTMLDivElement> }> = forwardRef<HTMLDivElement, NodeProps>(
  (
    {
      pathwayState,
      documentation,
      isOnPatientPath,
      isCurrentNode,
      xCoordinate,
      yCoordinate,
      expanded = false,
      onClickHandler
    },
    ref
  ) => {
    const { label } = pathwayState;
    const style = {
      top: yCoordinate,
      left: xCoordinate
    };
    const backgroundColorClass = isOnPatientPath ? styles.onPatientPath : styles.notOnPatientPath;
    const currentNodeClass = isCurrentNode ? styles.current : '';
    const expandedNodeClass = isCurrentNode
      ? styles.childCurrent
      : isOnPatientPath
      ? styles.childOnPatientPath
      : styles.childNotOnPatientPath;
    const isGuidance = isGuidanceState(pathwayState);
    return (
      <div
        className={`${styles.node} ${backgroundColorClass} ${expanded &&
          nodeStyles.expanded} ${currentNodeClass}`}
        style={style}
        ref={ref}
      >
        <div className={nodeStyles.nodeTitle} onClick={onClickHandler}>
          <NodeIcon pathwayState={pathwayState} isGuidance={isGuidance} />
          {label}
        </div>
        {expanded && (
          <div className={`${styles.expandedNode} ${expandedNodeClass}`}>
            <ExpandedNode
              pathwayState={pathwayState as GuidanceState}
              isActionable={isCurrentNode}
              isGuidance={isGuidance}
              documentation={documentation}
            />
          </div>
        )}
      </div>
    );
  }
);

const NodeIcon: FC<NodeIconProps> = ({ pathwayState, isGuidance }) => {
  let icon: IconProp = 'microscope';
  if (pathwayState.label === 'Start') icon = 'play';
  if (isGuidance) {
    const guidancePathwayState = pathwayState as GuidanceState;
    if (guidancePathwayState.action.length > 0) {
      const resourceType = guidancePathwayState.action[0].resource.resourceType;
      if (resourceType === 'MedicationRequest') icon = 'prescription-bottle-alt';
      else if (resourceType === 'MedicationAdministration') icon = 'capsules';
      else if (resourceType === 'Procedure') icon = 'syringe';
    }
  }
  return <FontAwesomeIcon icon={icon} className={styles.icon} />;
};

export default Node;
