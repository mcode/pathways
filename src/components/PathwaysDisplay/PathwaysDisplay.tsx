import React, { FC } from 'react';
import { usePathwayContext } from 'components/PathwayProvider';

interface Props {
  foo?: string;
}

const PathwaysDisplay: FC<Props> = () => {
  // example of how children components can access the current in-context pathway
  // doesn't need tests, is just a placeholder
  const pathway = usePathwayContext().pathway;
  return (
    <div>
      Current Pathway: {pathway === null ? 'Unknown' : pathway.name}
      <br />
      Number of States: {pathway === null ? '0' : Object.keys(pathway.states).length}
    </div>
  );
};

export default PathwaysDisplay;
