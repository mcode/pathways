import React, { FC, useState, useEffect, useRef } from 'react';

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
  const [renderedPathway, setRenderedPathway] = useState<string | null>(null);

  const parentWidth = graphElement?.current?.parentElement?.clientWidth ?? 0;

  useEffect(() => {
    setWindowWidth(parentWidth);
  }, [parentWidth]);

  // Get the layout of the graph
  const getGraphLayout = (expandedNodes: ExpandedNodes): Coordinates => {
    return graphLayout(pathway, expandedNodes);
  };

  // Create a fake Bundle for the CQL engine and check if patientPath needs to be evaluated
  const patient = {
    resourceType: 'Bundle',
    entry: resources.map((r: object) => ({ resource: r }))
  };

  if ((renderedPathway === null || renderedPathway !== pathway.name) && patient.entry.length > 0)
    evaluatePatientOnPathway(patient, pathway).then(pathwayResults => {
      setPath(pathwayResults.path);
      setRenderedPathway(pathway.name);
    });

  const currentNode = path[path.length - 1];

  const expandedNodes: ExpandedNodes = {};

  const [layout, setLayout] = useState(getGraphLayout(expandedNodes));
  const maxHeight: number =
    layout !== undefined
      ? Object.values(layout)
          .map(x => x.y)
          .reduce((a, b) => Math.max(a, b))
      : 0;

  const initialExpandedState = Object.keys(layout).reduce(
    (acc: { [key: string]: boolean }, curr: string) => {
      acc[curr] = false;
      return acc;
    },
    {}
  );

  useEffect(() => {
    if (expandCurrentNode) {
      if (currentNode) setExpanded(currentNode, true);
    }
  }, [currentNode]);

  const [expanded, _setExpanded] = useState<{ [key: string]: boolean | undefined }>(
    initialExpandedState
  );
  const setExpanded = (key: string, expand?: boolean) => {
    const toggle = expand === undefined ? !expanded[key] : expand;
    _setExpanded({ ...expanded, [`${key}`]: toggle });
  };

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
  }, [expanded]);

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
