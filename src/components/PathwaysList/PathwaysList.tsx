import React, { FC, ReactNode, useState } from 'react';
import { Service } from 'pathways-objects';
import { Pathway } from 'pathways-model';

import classes from './PathwaysList.module.scss';
import indexClasses from 'styles/index.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Graph from 'components/Graph';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { usePathwayContext } from 'components/PathwayProvider';

interface PathwaysListElementProps {
  pathway: Pathway;
  resources: any;
  callback: Function;
}

interface PathwaysListProps {
  callback: Function;
  service: Service<Array<Pathway>>;
  resources: any;
}

const PathwaysList: FC<PathwaysListProps> = ({ callback, service, resources }) => {
  function renderList(list: Pathway[]): ReactNode {
    return (
      <div>
        {list.map(pathway => {
          return (
            <PathwaysListElement
              pathway={pathway}
              callback={callback}
              resources={resources}
              key={pathway.name}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className={classes.pathways_list}>
      {service.status === 'loading' ? (
        <div>Loading...</div>
      ) : service.status === 'loaded' ? (
        <div className={classes.container}>
          <div className={classes.header_title}>
            <div className={classes.header_title__header}>Explore Pathways</div>
            <div className={classes.header_title__note}>Select pathway below to view details</div>
          </div>

          {renderList(service.payload)}
        </div>
      ) : (
        <div>ERROR</div>
      )}
    </div>
  );
};

const PathwaysListElement: FC<PathwaysListElementProps> = ({ pathway, resources, callback }) => {
  const pathwayCtx = usePathwayContext();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const chevron: IconProp = isVisible ? 'chevron-up' : 'chevron-down';

  function toggleVisible() {
    setIsVisible(!isVisible);
  }

  return (
    <div className={classes['pathway-element']} role={'list'} key={pathway.name}>
      <div
        className={classes.title}
        role={'listitem'}
        onClick={e => {
          pathwayCtx.setPathway(pathway, true);
          toggleVisible();
        }}
      >
        <div>{pathway.name}</div>
        <div className={classes.expand}>
          <FontAwesomeIcon icon={chevron} />
        </div>
        <div className={classes.numElements}>4</div>
      </div>

      {isVisible && (
        <div className={classes.infoContainer}>
          <div className={classes.details}>
            <p>{pathway.description}</p>
            <table>
              <tbody>
                <tr>
                  <th></th>
                  <th>mCODE elements</th>
                  <th>patient elements</th>
                </tr>
                <tr>
                  <td>condition</td>
                  <td>breast cancer</td>
                  <td>breast cancer</td>
                </tr>
                <tr>
                  <td>stage</td>
                  <td>1a</td>
                  <td>1a</td>
                </tr>
                <tr>
                  <td>node status</td>
                  <td>N+/N0</td>
                  <td>N+</td>
                </tr>
                <tr>
                  <td>tumor size</td>
                  <td>any</td>
                  <td>2.5cm</td>
                </tr>
              </tbody>
            </table>
            <button className={indexClasses.button} onClick={() => callback(pathway)}>
              Select Pathway
            </button>
          </div>
          <div className={classes.pathway}>
            <Graph resources={resources} pathwayProp={pathway} />
            <div className={classes.controls}>
              <FontAwesomeIcon icon={'play'} />
              <FontAwesomeIcon icon={'plus'} />
              <FontAwesomeIcon icon={'minus'} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PathwaysList;
