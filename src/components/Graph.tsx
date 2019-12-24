import React, { FC, useState, useEffect } from 'react';

import graphLayout from 'visualization/layout';
import Node from './Node';
import evaluatePatientOnPathway from 'engine';
import { usePathwayContext } from './PathwayProvider';

interface GraphProps {
  resources: Array<any>;
}

const Graph: FC<GraphProps> = ({ resources }) => {
  const windowWidth = useWindowWidth();
  const pathway = usePathwayContext().pathway;
  const [path, setPath] = useState<string[]>([]);

  if (pathway === null) return <div>No Pathway Loaded</div>;

  // Get the layout of the graph
  const getGraphLayout = () => {
    return graphLayout(pathway);
  };

  // Create a fake Bundle for the CQL engine
  const patient = { resourceType: 'Bundle', entry: resources.map((r: any) => ({ resource: r })) };
  if (path.length === 0 && patient.entry.length > 0)
    evaluatePatientOnPathway(patient, pathway).then(pathwayResults => setPath(pathwayResults.path));

  const layout = getGraphLayout();
  const maxHeight: number =
    layout !== undefined
      ? Object.values(layout)
          .map(x => x.y)
          .reduce((a, b) => Math.max(a, b))
      : 0;

  return (
    <div style={{ height: maxHeight + 150 + 'px', position: 'relative' }}>
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
  function getWidth() {
    return window.innerWidth;
  }

  const [windowWidth, setWindowWidth] = useState(getWidth);

  useEffect(() => {
    function handleResize() {
      setWindowWidth(getWidth());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return windowWidth;
}

export default Graph;
