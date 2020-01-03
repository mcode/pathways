import React, { FC, useState, useEffect, useRef } from 'react';

import graphLayout from 'visualization/layout';
import Node from './Node';
import evaluatePatientOnPathway from 'engine';
import { usePathwayContext } from './PathwayProvider';
import { Pathway } from 'pathways-model';

interface GraphProps {
  pathwayProp?: Pathway | null;
  resources: Array<any>;
}

const Graph: FC<GraphProps> = ({ resources, pathwayProp }) => {
  const graphElement = useRef(null);
  const pathwayCtx = usePathwayContext();
  const pathway = pathwayProp !== undefined ? pathwayProp : pathwayCtx.pathway;
  const [path, setPath] = useState<string[]>([]);
  const [windowWidth, setWindowWidth] = useState<number>(useWindowWidth());
  const [renderedPathway, setRenderedPathway] = useState<string | null>(null);

  const parentWidth = graphElement.current
    ? (graphElement.current! as any).parentNode.clientWidth
    : 0;

  useEffect(() => {
    setWindowWidth(parentWidth);
  }, [parentWidth]);

  if (pathway === null) return <div>No Pathway Loaded</div>;

  // Get the layout of the graph
  const getGraphLayout = () => {
    return graphLayout(pathway);
  };

  // Create a fake Bundle for the CQL engine and check if patientPath needs to be evaluated
  const patient = { resourceType: 'Bundle', entry: resources.map((r: any) => ({ resource: r })) };
  if ((renderedPathway === null || renderedPathway !== pathway.name) && patient.entry.length > 0)
    evaluatePatientOnPathway(patient, pathway).then(pathwayResults => {
      setPath(pathwayResults.path);
      setRenderedPathway(pathway.name);
    });

  const layout = getGraphLayout();
  const maxHeight: number =
    layout !== undefined
      ? Object.values(layout)
          .map(x => x.y)
          .reduce((a, b) => Math.max(a, b))
      : 0;

  return (
    <div ref={graphElement} style={{ height: maxHeight + 150 + 'px', position: 'relative' }}>
      {layout !== undefined
        ? Object.keys(layout).map(key => {
            return (
              <Node
                key={key}
                pathwayState={pathway.states[key]}
                isOnPatientPath={path.includes(key)}
                isCurrentNode={path[path.length - 1] === key}
                xCoordinate={layout[key].x + windowWidth / 2}
                yCoordinate={layout[key].y}
              />
            );
          })
        : []}
    </div>
  );
};

function useWindowWidth() {
  const getWidth = () => window.innerWidth;
  const [windowWidth, setWindowWidth] = useState(getWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(getWidth);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return windowWidth;
}

export default Graph;
