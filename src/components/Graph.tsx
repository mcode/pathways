import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import graphLayout from 'visualization/layout';
import Node from './Node';
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
  const { coordinates, edges } = layout;
  const maxHeight = useMemo(() => {
    return coordinates !== undefined
      ? Object.values(coordinates)
          .map(x => x.y)
          .reduce((a, b) => Math.max(a, b))
      : 0;
  }, [coordinates]);

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
        if (pathway.states[e].action) {
          expandedNodes[e] = {
            width: 400,
            height: 450
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
      {coordinates !== undefined
        ? Object.keys(coordinates).map(key => {
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
                xCoordinate={coordinates[key].x + windowWidth / 2}
                yCoordinate={coordinates[key].y}
                expanded={expanded[key]}
                onClickHandler={onClickHandler}
              />
            );
          })
        : []}
      {edges !== undefined
        ? Object.keys(edges).map(edge => {
            return (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  position: 'absolute',
                  width: '2000px',
                  height: '2000px',
                  transition: 'all 2s linear',
                  zIndex: 1,
                  top: 0,
                  left: 0,
                  overflow: 'visible'
                }}
              >
                {edges[edge].points.map((p, i, arr) => {
                  if (i === arr.length - 1) return null;
                  const point2 = arr[i + 1];
                  return i !== arr.length - 2 ? (
                    <line
                      x1={p.x + windowWidth / 2}
                      y1={p.y}
                      x2={point2.x + windowWidth / 2}
                      y2={point2.y}
                      stroke="black"
                      strokeWidth="1"
                    />
                  ) : (
                    <line
                      x1={p.x + windowWidth / 2}
                      y1={p.y}
                      x2={point2.x + windowWidth / 2}
                      y2={point2.y}
                      stroke="black"
                      strokeWidth="1"
                      markerEnd="url(#arrowhead)"
                    />
                  );
                })}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="0"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" />
                  </marker>
                </defs>
              </svg>
            );
          })
        : []}
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
