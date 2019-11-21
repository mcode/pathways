import React, { FC } from 'react';
import { usePathwayContext } from 'components/PathwayProvider';

interface Props {
  foo?: string;
}

const PatientRecord: FC<Props> = () => {
  // example of how children components can access the current in-context pathway
  // doesn't need tests, is just a placeholder
  const pathway = usePathwayContext();
  return (
    <div>
      Current Pathway: {pathway.name}
      <br />
      Number of States: {Object.keys(pathway.states).length}
    </div>
  );
};

export default PatientRecord;
