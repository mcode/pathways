import React, {
  FC,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo
} from 'react';

import graphLayout from 'visualization/layout';
import Node from 'components/Node';
import Arrow from 'components/Arrow';
import { evaluatePatientOnPathway } from 'engine';
import {
  EvaluatedPathway,
  PathwayResults,
  DocumentationResource,
  Pathway,
  Documentation
} from 'pathways-model';
import { Layout, NodeDimensions, NodeCoordinates, Edges, Edge } from 'graph-model';
import { usePatientRecords } from 'components/PatientRecordsProvider';
import { DomainResource } from 'fhir-objects';
import styles from './Graph.module.scss';
import ResizeSensor from 'css-element-queries/src/ResizeSensor';

interface GraphProps {
  evaluatedPathway: EvaluatedPathway;
  interactive?: boolean;
  expandCurrentNode?: boolean;
  updateEvaluatedPathways: (value: EvaluatedPathway) => void;
}

const getPath = (pathwayResults: PathwayResults): string[] => {
  return Object.values(pathwayResults.documentation)
    .filter(doc => doc.onPath)
    .map(doc => doc.state);
};

const isEdgeOnPatientPath = (pathwayResults: PathwayResults, edge: Edge): boolean => {
  const path = getPath(pathwayResults);
  const startIndex = path.indexOf(edge.start);
  const endIndex = path.indexOf(edge.end);
  if (startIndex !== -1 && endIndex !== -1 && startIndex + 1 === endIndex) return true;
  else if (startIndex === path.length - 1 && pathwayResults.currentStates.includes(edge.end))
    return true;
  else return false;
};

const Graph: FC<GraphProps> = memo(
  ({ evaluatedPathway, interactive = true, expandCurrentNode = true, updateEvaluatedPathways }) => {
    const patientRecords = usePatientRecords();
    const resources = patientRecords.patientRecords;
    const pathway = evaluatedPathway.pathway;
    const graphElement = useRef<HTMLDivElement>(null);
    const nodeRefs = useRef<{ [key: string]: HTMLDivElement }>({});
    const [parentWidth, setParentWidth] = useState<number>(
      graphElement?.current?.parentElement?.clientWidth ?? 0
    );

    const setPath = useCallback(
      (value: PathwayResults): void => {
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
            .map(x => x.x + parentWidth / 2)
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
    const layoutKeys = Object.keys(layout).toString();
    const initialExpandedState = useMemo(() => {
      return layoutKeys.split(',').reduce((acc: { [key: string]: boolean }, curr: string) => {
        acc[curr] = false;
        return acc;
      }, {});
    }, [layoutKeys]);

    const [expanded, _setExpanded] = useState<{ [key: string]: boolean | undefined }>(
      initialExpandedState
    );

    const setExpanded = useCallback((key: string, expand?: boolean): void => {
      _setExpanded(prevState => {
        return { ...prevState, [key]: !prevState[key] };
      });
    }, []);

    // Evaluate patient on the pathway
    useEffect(() => {
      // Keeps track of whether the current useEffect cycle has ended
      let cancel = false;

      if (
        resources.length > 0 &&
        (!evaluatedPathway.pathwayResults || patientRecords.evaluatePath)
      ) {
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
    }, [pathway, resources, evaluatedPathway.pathwayResults, setPath, patientRecords]);

    // Expand all the current nodes by default if allowed
    useEffect(() => {
      if (evaluatedPathway.pathwayResults) {
        for (const currentNode of evaluatedPathway.pathwayResults.currentStates) {
          if (expandCurrentNode) {
            if (currentNode) setExpanded(currentNode, true);
          }
        }
      }
    }, [expandCurrentNode, evaluatedPathway.pathwayResults, setExpanded]);

    // Recalculate graph layout if graph container size changes
    useEffect(() => {
      if (graphElement.current?.parentElement) {
        new ResizeSensor(graphElement.current.parentElement, function() {
          setParentWidth(graphElement.current?.parentElement?.clientWidth ?? 0);
          setLayout(getGraphLayout());
        });
      }
    }, [getGraphLayout]);

    // Recalculate graph layout if a node is expanded
    useEffect(() => {
      setLayout(getGraphLayout());
    }, [expanded, getGraphLayout]);

    // maxWidth finds the edge label that is farthest to the right
    const maxWidth: number =
      edges !== undefined
        ? Object.values(edges)
            .map(e => e.label)
            .map(l => (l ? l.x + l.text.length * 10 + parentWidth / 2 : 0))
            .reduce((a, b) => Math.max(a, b), 0)
        : parentWidth;

    const documentation = evaluatedPathway.pathwayResults
      ? evaluatedPathway.pathwayResults.documentation
      : {};

    return (
      <GraphMemo
        graphElement={graphElement}
        interactive={interactive}
        maxHeight={maxHeight}
        nodeCoordinates={nodeCoordinates}
        documentation={documentation}
        edges={edges}
        evaluatedPathway={evaluatedPathway}
        nodeRefs={nodeRefs}
        parentWidth={parentWidth}
        maxWidth={maxWidth}
        pathway={pathway}
        expanded={expanded}
        setExpanded={setExpanded}
      />
    );
  }
);

interface GraphMemoProps {
  graphElement: RefObject<HTMLDivElement>;
  interactive: boolean;
  maxHeight: number;
  nodeCoordinates: NodeCoordinates;
  documentation: { [key: string]: Documentation };
  edges: Edges;
  evaluatedPathway: EvaluatedPathway;
  nodeRefs: React.MutableRefObject<{
    [key: string]: HTMLDivElement;
  }>;
  parentWidth: number;
  maxWidth: number;
  pathway: Pathway;
  expanded: {
    [key: string]: boolean | undefined;
  };
  setExpanded: (key: string, expand?: boolean | undefined) => void;
}

const GraphMemo: FC<GraphMemoProps> = memo(
  ({
    graphElement,
    interactive,
    maxHeight,
    nodeCoordinates,
    documentation,
    edges,
    evaluatedPathway,
    nodeRefs,
    parentWidth,
    maxWidth,
    pathway,
    expanded,
    setExpanded
  }) => {
    return (
      <div
        ref={graphElement}
        id="graph-root"
        className={styles.root}
        style={{
          height: interactive ? maxHeight + 150 : 'inherit',
          width: maxWidth + 'px',
          position: 'relative',
          marginRight: '5px'
        }}
      >
        {nodeCoordinates !== undefined
          ? Object.keys(nodeCoordinates).map(nodeName => {
              const docResource = documentation[nodeName] as DocumentationResource;
              const onClickHandler = interactive ? (): void => setExpanded(nodeName) : undefined;
              return (
                <Node
                  key={nodeName}
                  documentation={docResource}
                  ref={(node: HTMLDivElement): void => {
                    nodeRefs.current[nodeName] = node;
                  }}
                  pathwayState={pathway.states[nodeName]}
                  isOnPatientPath={
                    evaluatedPathway.pathwayResults
                      ? getPath(evaluatedPathway.pathwayResults).includes(nodeName) ||
                        evaluatedPathway.pathwayResults.currentStates.includes(nodeName)
                      : false
                  }
                  isCurrentNode={
                    evaluatedPathway.pathwayResults
                      ? evaluatedPathway.pathwayResults.currentStates.includes(nodeName)
                      : false
                  }
                  xCoordinate={nodeCoordinates[nodeName].x + parentWidth / 2}
                  yCoordinate={nodeCoordinates[nodeName].y}
                  expanded={expanded[nodeName]}
                  onClickHandler={onClickHandler}
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
                    isOnPatientPath={
                      evaluatedPathway.pathwayResults
                        ? isEdgeOnPatientPath(evaluatedPathway.pathwayResults, edge)
                        : false
                    }
                    widthOffset={parentWidth / 2}
                  />
                );
              })
            : []}
        </svg>
      </div>
    );
  }
);

export default Graph;
