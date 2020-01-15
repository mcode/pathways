import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import graphLayout from 'visualization/layout';
import Node from './Node';
import Arrow from './Arrow';
import evaluatePatientOnPathway from 'engine';
import { Pathway } from 'pathways-model';
import { Layout, ExpandedNodes } from 'graph-model';

interface GraphProps {
  pathway: Pathway;
  resources: object[];
  interactive?: boolean;
  expandCurrentNode?: boolean;
}

const Graph: FC<GraphProps> = ({
  resources,
  pathway,
  interactive = true,
  expandCurrentNode = true
}) => {
  const graphElement = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState<string[]>([]);
  const [windowWidth, setWindowWidth] = useState<number>(useWindowWidth());

  const parentWidth = graphElement?.current?.parentElement?.clientWidth ?? 0;

  useEffect(() => {
    setWindowWidth(parentWidth);
  }, [parentWidth]);

  // Get the layout of the graph
  const getGraphLayout = useCallback(
    (expandedNodes: ExpandedNodes): Layout => {
      return graphLayout(pathway, expandedNodes);
    },
    [pathway]
  );

  const [layout, setLayout] = useState(getGraphLayout({}));
  const { nodeCoordinates, edges } = layout;
  const maxHeight = useMemo(() => {
    return nodeCoordinates !== undefined
      ? Object.values(nodeCoordinates)
          .map(x => x.y)
          .reduce((a, b) => Math.max(a, b))
      : 0;
  }, [nodeCoordinates]);

  const initialExpandedState = useMemo(() => {
    return Object.keys(layout).reduce((acc: { [key: string]: boolean }, curr: string) => {
      acc[curr] = false;
      return acc;
    }, {});
  }, [layout]);

  const [expanded, _setExpanded] = useState<{ [key: string]: boolean | undefined }>(
    initialExpandedState
  );

  const setExpanded = useCallback((key: string, expand?: boolean): void => {
    _setExpanded(prevState => {
      return { ...prevState, [key]: !prevState[key] };
    });
  }, []);

  useEffect(() => {
    if (resources.length > 0) {
      // Create a fake Bundle for the CQL engine and check if patientPath needs to be evaluated
      const patient = {
        resourceType: 'Bundle',
        entry: resources.map((r: object) => ({ resource: r }))
      };

      evaluatePatientOnPathway(patient, pathway).then(pathwayResults => {
        setPath(pathwayResults.path);
      });
    }
  }, [pathway, resources]);

  useEffect(() => {
    const currentNode = path[path.length - 1];
    if (expandCurrentNode) {
      if (currentNode) setExpanded(currentNode, true);
    }
  }, [expandCurrentNode, path, setExpanded]);

  useEffect(() => {
    const expandedNodes: ExpandedNodes = {};

    Object.keys(expanded)
      .filter(node => expanded[node])
      .forEach(e => {
        const action = pathway.states[e].action;

        if (action) {
          // Adjust height depending on the action description's length
          const height = action.length === 0 ? 100 : 450 + Math.floor(action[0].description.length / 25) * 25;

          expandedNodes[e] = {
            height,
            width: 400
          };
        } else {
          expandedNodes[e] = {
            width: 400,
            height: 50
          };
        }
      });

    setLayout(getGraphLayout(expandedNodes));
  }, [expanded, getGraphLayout, pathway.states]);

  return (
    <div ref={graphElement} style={{ height: maxHeight + 150 + 'px', position: 'relative' }}>
      {nodeCoordinates !== undefined
        ? Object.keys(nodeCoordinates).map(key => {
            const isCurrentNode = (): boolean => {
              return path[path.length - 1] === key;
            };
            const onClickHandler = interactive ? (): void => setExpanded(key) : undefined;
            return (
              <Node
                key={key}
                pathwayState={pathway.states[key]}
                isOnPatientPath={path.includes(key)}
                isCurrentNode={isCurrentNode()}
                xCoordinate={nodeCoordinates[key].x + windowWidth / 2}
                yCoordinate={nodeCoordinates[key].y}
                expanded={expanded[key]}
                onClickHandler={onClickHandler}
              />
            );
          })
        : []}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: windowWidth + 250,
          height: maxHeight + 50,
          transition: 'all 2s linear',
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
                  isOnPatientPath={path.includes(edge.start) && path.includes(edge.end)}
                  widthOffset={windowWidth / 2}
                />
              );
            })
          : []}
      </svg>
    </div>
  );
};

function useWindowWidth(): number {
  const getWidth = (): number => window.innerWidth;
  const [windowWidth, setWindowWidth] = useState(getWidth);

  useEffect(() => {
    const handleResize = (): void => setWindowWidth(getWidth);

    window.addEventListener('resize', handleResize);
    return (): void => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return windowWidth;
}

export default Graph;
