import React, { FC, ReactNode, useState } from 'react';
import { Service } from 'pathways-objects';
import { Pathway, PatientPathway, CriteriaResult } from 'pathways-model';

import classes from './PathwaysList.module.scss';
import indexClasses from 'styles/index.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Graph from 'components/Graph';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { usePathwayContext } from 'components/PathwayProvider';
import { evaluatePathwayCriteria } from 'engine';

interface PathwaysListElementProps {
  patientPathway: PatientPathway;
  resources: Array<fhir.DomainResource>;
  callback: Function;
}

interface PathwaysListProps {
  patientPathwayList: PatientPathway[];
  callback: Function;
  service: Service<Array<Pathway>>;
  resources: Array<fhir.DomainResource>;
}

const PathwaysList: FC<PathwaysListProps> = ({
  patientPathwayList,
  callback,
  service,
  resources
}) => {
  function renderList(): ReactNode {
    return (
      <div>
        {patientPathwayList.map(patientPathway => {
          return (
            <PathwaysListElement
              patientPathway={patientPathway}
              callback={callback}
              resources={resources}
              key={patientPathway.pathway.name}
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

          {renderList()}
        </div>
      ) : (
        <div>ERROR</div>
      )}
    </div>
  );
};

const PathwaysListElement: FC<PathwaysListElementProps> = ({
  patientPathway,
  resources,
  callback
}) => {
  const pathway = patientPathway.pathway;
  const pathwayCtx = usePathwayContext();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const [criteria, setCriteria] = useState<CriteriaResult[] | null>(null);

  if (criteria == null && resources != null && resources.length > 0) {
    // Create a fake Bundle for the CQL engine and check if patientPath needs to be evaluated
    const patient = {
      resourceType: 'Bundle',
      entry: resources.map((r: fhir.Resource) => ({ resource: r }))
    };
    evaluatePathwayCriteria(patient, pathway).then(c => setCriteria(c));
  }

  const chevron: IconProp = isVisible ? 'chevron-up' : 'chevron-down';

  function toggleVisible(): void {
    setIsVisible(!isVisible);
  }

  return (
    <div className={classes['pathway-element']} role={'list'} key={pathway.name}>
      <div
        className={classes.title}
        role={'listitem'}
        onClick={(e): void => {
          pathwayCtx.setPatientPathway(patientPathway, true);
          toggleVisible();
        }}
      >
        <div>{pathway.name}</div>
        <div className={classes.expand}>
          <FontAwesomeIcon icon={chevron} />
        </div>
        <div className={classes.numElements}>
          {criteria && criteria.filter(c => c.match).length}
        </div>
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
                {criteria &&
                  criteria.map(c => (
                    <tr key={c.elementName}>
                      <td>{c.elementName}</td>
                      <td>{c.expected}</td>
                      <td className={c.match ? classes.matchingElement : undefined}>{c.actual}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <button className={indexClasses.button} onClick={(): void => callback(patientPathway)}>
              Select Pathway
            </button>
          </div>
          <div className={classes.pathway}>
            <Graph
              resources={resources}
              patientPathway={patientPathway}
              interactive={false}
              expandCurrentNode={false}
              updatePatientPathwayList={pathwayCtx.updatePatientPathwayList}
            />
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
