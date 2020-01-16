import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import graphLayout from 'visualization/layout';
import Node from './Node';
import evaluatePatientOnPathway from 'engine';
import { Pathway } from 'pathways-model';
import { Coordinates, ExpandedNodes } from 'graph-model';

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
    (expandedNodes: ExpandedNodes): Coordinates => {
      return graphLayout(pathway, expandedNodes);
    },
    [pathway]
  );

  const [layout, setLayout] = useState(getGraphLayout({}));
  const maxHeight = useMemo(() => {
    return layout !== undefined
      ? Object.values(layout)
          .map(x => x.y)
          .reduce((a, b) => Math.max(a, b))
      : 0;
  }, [layout]);

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
      return { ...prevState, [`${key}`]: !prevState[`${key}`] };
    });
  }, []);

  useEffect(() => {
    // Create a fake Bundle for the CQL engine and check if patientPath needs to be evaluated
    const patient = {
      resourceType: 'Bundle',
      entry: resources.map((r: object) => ({ resource: r }))
    };

    evaluatePatientOnPathway(patient, pathway).then(pathwayResults => {
      setPath(pathwayResults.path);
    });
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
      {layout !== undefined
        ? Object.keys(layout).map(key => {
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
                xCoordinate={layout[key].x + windowWidth / 2}
                yCoordinate={layout[key].y}
                expanded={expanded[key]}
                onClickHandler={onClickHandler}
              />
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
