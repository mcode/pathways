import React, { FC, ReactNode, useState } from 'react';
import { Service } from 'pathways-objects';
import { Pathway, EvaluatedPathway, CriteriaResult } from 'pathways-model';

import styles from './PathwaysList.module.scss';
import indexStyles from 'styles/index.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Graph from 'components/Graph';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { usePathwayContext } from 'components/PathwayProvider';
import { evaluatePathwayCriteria } from 'engine';
import { usePatientRecords } from 'components/PatientRecordsProvider';
import {
  faPlay,
  faPlus,
  faMinus,
  faChevronUp,
  faChevronDown,
  faCaretDown
} from '@fortawesome/free-solid-svg-icons';

interface PathwaysListElementProps {
  evaluatedPathway: EvaluatedPathway;
  callback: Function;
}

interface PathwaysListProps {
  evaluatedPathways: EvaluatedPathway[];
  callback: Function;
  service: Service<Array<Pathway>>;
}

const PathwaysList: FC<PathwaysListProps> = ({ evaluatedPathways, callback, service }) => {
  function renderList(): ReactNode {
    return (
      <div>
        <div className={styles.matchedElementsLabel}>
          <i>
            mCODE
            <br />
            elements
            <br />
            matched
          </i>
          <FontAwesomeIcon icon={faCaretDown} />
        </div>
        {evaluatedPathways.map(evaluatedPathway => {
          return (
            <PathwaysListElement
              evaluatedPathway={evaluatedPathway}
              callback={callback}
              key={evaluatedPathway.pathway.name}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className={styles.pathways_list}>
      {service.status === 'loading' ? (
        <div>Loading...</div>
      ) : service.status === 'loaded' ? (
        <div className={styles.container}>
          <div className={styles.header_title}>
            <div className={styles.header_title__header}>Explore Pathways</div>
            <div className={styles.header_title__note}>Select pathway below to view details</div>
          </div>

          {renderList()}
        </div>
      ) : (
        <div>ERROR</div>
      )}
    </div>
  );
};

const PathwaysListElement: FC<PathwaysListElementProps> = ({ evaluatedPathway, callback }) => {
  const resources = usePatientRecords().patientRecords;
  const pathway = evaluatedPathway.pathway;
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

  const chevron: IconProp = isVisible ? faChevronUp : faChevronDown;

  function toggleVisible(): void {
    setIsVisible(!isVisible);
  }
  return (
    <div className={styles.pathwayElement} role={'list'} key={pathway.name}>
      <div
        className={styles.title}
        role={'listitem'}
        onClick={(e): void => {
          pathwayCtx.setEvaluatedPathway(evaluatedPathway, true);
          toggleVisible();
        }}
      >
        <div>{pathway.name}</div>
        <div className={styles.expand}>
          <FontAwesomeIcon icon={chevron} />
        </div>
        <div className={styles.numElements}>{criteria && criteria.filter(c => c.match).length}</div>
      </div>

      {isVisible && (
        <div className={styles.infoContainer}>
          <div className={styles.details}>
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
                      <td className={c.match ? styles.matchingElement : undefined}>{c.actual}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <button className={indexStyles.button} onClick={(): void => callback(evaluatedPathway)}>
              Select Pathway
            </button>
          </div>
          <div className={styles.pathway}>
            <Graph
              evaluatedPathway={evaluatedPathway}
              interactive={false}
              expandCurrentNode={false}
              updateEvaluatedPathways={pathwayCtx.updateEvaluatedPathways}
            />
            <div className={styles.controls}>
              <FontAwesomeIcon icon={faPlay} />
              <FontAwesomeIcon icon={faPlus} />
              <FontAwesomeIcon icon={faMinus} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PathwaysList;
