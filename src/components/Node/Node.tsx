import React, { FC } from 'react';
import { GuidanceState, State, DocumentationResource } from 'pathways-model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import classes from './Node.module.scss';
import nodeClasses from 'styles/index.module.scss';
import ExpandedNode from 'components/ExpandedNode';
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
}

/*
Node type
========
Completed guidance
Uncompleted guidance
Completed branch
Uncompleted branch
*/

const Node: FC<NodeProps> = ({
  pathwayState,
  documentation,
  isOnPatientPath,
  isCurrentNode,
  xCoordinate,
  yCoordinate,
  expanded = false,
  onClickHandler
}) => {
  const { label } = pathwayState;
  const style = {
    top: yCoordinate,
    left: xCoordinate
  };
  const backgroundColorClass = isOnPatientPath ? classes.onPatientPath : classes.notOnPatientPath;
  const currentNodeClass = isCurrentNode ? classes.current : '';
  const ExpandedNodeClass = isCurrentNode
    ? classes.childCurrent
    : isOnPatientPath
    ? classes.childOnPatientPath
    : classes.childNotOnPatientPath;
  return (
    <div
      className={`${classes.node} ${backgroundColorClass} ${expanded &&
        nodeClasses.expanded} ${currentNodeClass}`}
      style={style}
    >
      <div className={nodeClasses.nodeTitle} onClick={onClickHandler}>
        <NodeIcon pathwayState={pathwayState} />
        {label}
      </div>
      {expanded && (isGuidanceState(pathwayState) || documentation) && (
        <div className={`${classes.ExpandedNode} ${ExpandedNodeClass}`}>
          <ExpandedNode
            pathwayState={pathwayState as GuidanceState}
            isActionable={isCurrentNode}
            documentation={documentation}
            isGuidance={isGuidanceState(pathwayState)}
          />
        </div>
      )}
    </div>
  );
};

const NodeIcon: FC<NodeIconProps> = ({ pathwayState }) => {
  let icon: IconProp = 'microscope';
  if (pathwayState.label === 'Start') icon = 'play';
  if (isGuidanceState(pathwayState)) {
    const guidancePathwayState = pathwayState as GuidanceState;
    if (guidancePathwayState.action.length > 0) {
      const resourceType = guidancePathwayState.action[0].resource.resourceType;
      if (resourceType === 'MedicationRequest') icon = 'prescription-bottle-alt';
      else if (resourceType === 'MedicationAdministration') icon = 'capsules';
      else if (resourceType === 'Procedure') icon = 'syringe';
    }
  }
  return <FontAwesomeIcon icon={icon} className={classes.icon} />;
};

function isGuidanceState(state: State): boolean {
  const { action } = state as GuidanceState;
  return action ? action.length > 0 : false;
}

export default Node;
