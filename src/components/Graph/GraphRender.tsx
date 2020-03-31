import React, { FC, RefObject } from 'react';
import { DocumentationResource, Pathway } from 'pathways-model';
import Arrow from 'components/Arrow';
import { NodeCoordinates, Edges, Edge } from 'graph-model';
import Node from 'components/Node';

interface GraphRenderProps {
  graphElement: RefObject<HTMLDivElement>;
  interactive: boolean;
  maxHeight: number;
  nodeCoordinates: NodeCoordinates;
  documentation: (string | DocumentationResource)[];
  edges: Edges;
  path: string[];
  nodeRefs: React.MutableRefObject<{
    [key: string]: HTMLDivElement;
  }>;
  windowWidth: number;
  maxWidth: number;
  pathway: Pathway;
  expanded: {
    [key: string]: boolean | undefined;
  };
  setExpanded: (key: string, expand?: boolean | undefined) => void;
}

const isEdgeOnPatientPath = (path: string[], edge: Edge): boolean => {
  const startIndex = path.indexOf(edge.start);
  const endIndex = path.indexOf(edge.end);
  return startIndex !== -1 && endIndex !== -1 && startIndex + 1 === endIndex;
};
const GraphRender: FC<GraphRenderProps> = React.memo(
  ({
    graphElement,
    interactive,
    maxHeight,
    nodeCoordinates,
    documentation,
    edges,
    path,
    nodeRefs,
    windowWidth,
    maxWidth,
    pathway,
    expanded,
    setExpanded
  }) => {
    return (
      <div
        ref={graphElement}
        style={{
          height: interactive ? maxHeight + 150 : 'inherit',
          position: 'relative',
          overflow: 'auto',
          marginRight: '5px'
        }}
      >
        {nodeCoordinates !== undefined
          ? Object.keys(nodeCoordinates).map(key => {
              const docResource = documentation.find((doc): doc is DocumentationResource => {
                return typeof doc !== 'string' && doc.state === key;
              });
              const isCurrentNode = (): boolean => {
                return path[path.length - 1] === key;
              };
              return (
                <Node
                  key={key}
                  _key={key}
                  documentation={docResource}
                  ref={(node: HTMLDivElement): void => {
                    nodeRefs.current[key] = node;
                  }}
                  pathwayState={pathway.states[key]}
                  isOnPatientPath={path.includes(key)}
                  isCurrentNode={isCurrentNode()}
                  xCoordinate={nodeCoordinates[key].x + windowWidth / 2}
                  yCoordinate={nodeCoordinates[key].y}
                  expanded={expanded[key]}
                  setExpanded={setExpanded}
                  interactive={interactive}
                />
              );
            })
          : []}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{
            // Adding 5 pixels to maxWidth so that the rightmost edge label is not cut off
            width: maxWidth + 5,
            height: maxHeight,
            zIndex: 1,
            top: 0,
            left: 0,
            overflow: 'visible'
          }}
        >
          {edges !== undefined
            ? Object.keys(edges).map(edgeName => {
                const edge = edges[edgeName];
                return (
                  <Arrow
                    key={edgeName}
                    edge={edge}
                    edgeName={edgeName}
                    isOnPatientPath={isEdgeOnPatientPath(path, edge)}
                    widthOffset={windowWidth / 2}
                  />
                );
              })
            : []}
        </svg>
      </div>
    );
  }
);

export default GraphRender;
