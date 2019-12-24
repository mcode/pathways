import React, { FC, ReactNode } from 'react';
import { Service } from 'pathways-objects';
import { Pathway } from 'pathways-model';

import classes from './PathwaysList.module.scss';

interface Props {
  callback: Function;
  service: Service<Array<Pathway>>;
}

const PathwaysList: FC<Props> = (props: Props) => {
  const service = props.service;
  function renderList(list: Pathway[]): ReactNode {
    return (
      <div>
        {list.map(pathway => {
          return renderElement(pathway);
        })}
      </div>
    );
  }

  function renderElement(pathway: Pathway): ReactNode {
    return (
      <div
        className={classes['pathway-element']}
        key={pathway.name}
        onClick={() => {
          return props.callback(pathway);
        }}
      >
        <div>{pathway.name}</div>
      </div>
    );
  }
  return (
    <div>
      {service.status === 'loading' ? (
        <div>Loading...</div>
      ) : service.status === 'loaded' ? (
        <div className={classes.container}>
          <p>
            <strong>Explore Pathways</strong>
          </p>
          <p>
            <em>Select pathway below to view details</em>
          </p>
          {renderList(service.payload)}
        </div>
      ) : (
        <div>ERROR</div>
      )}
    </div>
  );
};

export default PathwaysList;
