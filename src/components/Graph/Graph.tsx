import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import graphLayout from 'visualization/layout';
import Node from 'components/Node';
import Arrow from 'components/Arrow';
import { evaluatePatientOnPathway } from 'engine';
import { EvaluatedPathway, PathwayResults, DocumentationResource } from 'pathways-model';
import { Layout, NodeDimensions, Edge } from 'graph-model';
import { usePatientRecords } from 'components/PatientRecordsProvider';
import { DomainResource } from 'fhir-objects';

interface GraphProps {
  evaluatedPathway: EvaluatedPathway;
  interactive?: boolean;
  expandCurrentNode?: boolean;
  updateEvaluatedPathways: (value: EvaluatedPathway) => void;
}

const isEdgeOnPatientPath = (path: string[], edge: Edge): boolean => {
  const startIndex = path.indexOf(edge.start);
  const endIndex = path.indexOf(edge.end);
  return startIndex !== -1 && endIndex !== -1 && startIndex + 1 === endIndex;
};

const Graph: FC<GraphProps> = ({
  evaluatedPathway,
  interactive = true,
  expandCurrentNode = true,
  updateEvaluatedPathways
}) => {
  const patientRecords = usePatientRecords();
  const resources = patientRecords.patientRecords;
  const pathway = evaluatedPathway.pathway;
  const graphElement = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<{ [key: string]: HTMLDivElement }>({});
  const [windowWidth, setWindowWidth] = useState<number>(useWindowWidth());
  const parentWidth = graphElement?.current?.parentElement?.clientWidth ?? 0;
  const [path, _setPath] = useState<string[]>(
    evaluatedPathway.pathwayResults ? evaluatedPathway.pathwayResults.path : []
  );

  const setPath = useCallback(
    (value: PathwayResults): void => {
      _setPath(value.path);
      patientRecords.setEvaluatePath(false);
      updateEvaluatedPathways({ pathway: evaluatedPathway.pathway, pathwayResults: value });
    },
    [evaluatedPathway.pathway, updateEvaluatedPathways, patientRecords]
  );

  // Get the layout of the graph
  const getGraphLayout = useCallback((): Layout => {
    const nodeDimensions: NodeDimensions = {};

    // Retrieve dimensions from nodeRefs
    if (nodeRefs?.current) {
      Object.keys(nodeRefs.current).forEach(key => {
        const nodeElement = nodeRefs.current[key];
        const width = nodeElement.clientWidth;
        // nodeElement can have multiple children so calculate the sum to get the node height
        const height = Array.from(nodeElement.children).reduce(
          (acc, child) => acc + child.clientHeight,
          0
        );

        nodeDimensions[key] = { width, height };
      });
    }

    return graphLayout(pathway, nodeDimensions);
  }, [pathway]);

  const [layout, setLayout] = useState(getGraphLayout());
  const { nodeCoordinates, edges } = layout;
  const maxHeight = useMemo(() => {
    return nodeCoordinates !== undefined
      ? Object.values(nodeCoordinates)
          .map(x => x.y)
          .reduce((a, b) => Math.max(a, b))
      : 0;
  }, [nodeCoordinates]);

  // If a node has a negative x value, shift nodes and edges to the right by that value
  const minX =
    nodeCoordinates !== undefined
      ? Object.values(nodeCoordinates)
          .map(x => x.x + windowWidth / 2)
          .reduce((a, b) => Math.min(a, b))
      : 0;

  if (minX < 0) {
    const toAdd = minX * -1;
    Object.keys(nodeCoordinates).forEach(key => {
      const node = nodeCoordinates[key];
      node.x += toAdd;
    });

    Object.keys(edges).forEach(key => {
      const edge = edges[key];

      edge.points.forEach(p => (p.x += toAdd));
      if (edge.label) edge.label.x += toAdd;
    });
  }

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
    // Keeps track of whether the current useEffect cycle has ended
    let cancel = false;

    if (resources.length > 0 && (path.length === 0 || patientRecords.evaluatePath)) {
      // Create a fake Bundle for the CQL engine and check if patientPath needs to be evaluated
      const patient = {
        resourceType: 'Bundle',
        type: 'searchset',
        entry: resources.map((r: DomainResource) => ({ resource: r }))
      };
      evaluatePatientOnPathway(patient, pathway, resources).then(pathwayResults => {
        if (!cancel) setPath(pathwayResults);
      });

      return (): void => {
        cancel = true;
      };
    }
  }, [pathway, resources, path.length, setPath, patientRecords]);

  useEffect(() => {
    if (path) {
      const currentNode = path[path.length - 1];
      if (expandCurrentNode) {
        if (currentNode) setExpanded(currentNode, true);
      }
    }
  }, [expandCurrentNode, path, setExpanded]);

  // Recalculate graph layout if window size changes or if a node is expanded
  useEffect(() => {
    setWindowWidth(parentWidth);
    setLayout(getGraphLayout());
  }, [getGraphLayout, parentWidth]);

  useEffect(() => {
    setLayout(getGraphLayout());
  }, [expanded, getGraphLayout]);

  // maxWidth finds the edge label that is farthest to the right
  const maxWidth: number =
    (edges !== undefined
      ? Object.values(edges)
          .map(e => e.label)
          .map(l => (l ? l.x + l.text.length * 10 + windowWidth / 2 : 0))
          .reduce((a, b) => Math.max(a, b), 0)
      : windowWidth) + 5;

  const documentation = evaluatedPathway.pathwayResults
    ? evaluatedPathway.pathwayResults.documentation
    : [];

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
            const onClickHandler = interactive ? (): void => setExpanded(key) : undefined;
            return (
              <Node
                key={key}
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
                onClickHandler={onClickHandler}
              />
            );
          })
        : []}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: maxWidth,
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
