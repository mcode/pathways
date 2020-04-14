import React, { FC, ReactNode, useState, ButtonHTMLAttributes } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
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
import { CarePlan, Patient } from 'fhir-objects';
import { createCarePlan } from 'utils/fhirUtils';
import {
  faPlay,
  faPlus,
  faMinus,
  faChevronUp,
  faChevronDown,
  faCaretDown,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { usePatient } from 'components/PatientProvider';
import { useFHIRClient } from 'components/FHIRClient';

const useStyles = makeStyles(
  theme => ({
    'pathway-element': {
      backgroundColor: theme.palette.background.default
    },
    'selected-pathway-element': {
      backgroundColor: theme.palette.primary.main
    },
    title: {
      color: theme.palette.text.primary
    },
    'selected-title': {
      color: theme.palette.common.white
    }
  }),
  { name: 'PathwaysList' }
);

interface PathwaysListElementProps {
  evaluatedPathway: EvaluatedPathway;
  criteria?: CriteriaResult;
  callback: Function;
  selected: boolean;
  disableSelect: boolean;
}

interface PathwaysListProps {
  evaluatedPathways: EvaluatedPathway[];
  callback: Function;
  service: Service<Array<Pathway>>;
}

const PathwaysList: FC<PathwaysListProps> = ({ evaluatedPathways, callback, service }) => {
  const resources = usePatientRecords().patientRecords;
  const [criteria, setCriteria] = useState<CriteriaResult[] | null>(null);

  if (!criteria && evaluatedPathways.length > 0 && resources && resources.length > 0) {
    // Create a Bundle for the CQL engine and check if patientPath needs to be evaluated
    const patient = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: resources.map((r: fhir.Resource) => ({ resource: r }))
    };

    // Evaluate pathway criteria for each pathway
    const criteriaPromises = evaluatedPathways.map(pathway =>
      evaluatePathwayCriteria(patient, pathway.pathway)
    );
    Promise.all(criteriaPromises).then(criteriaResults => {
      setCriteria(criteriaResults.sort((a, b) => b.matches - a.matches));
    });
  }

  function renderList(): ReactNode {
    return (
      <div>
        {criteria ? (
          criteria.map(c => {
            const evaluatedPathway = evaluatedPathways.find(p => p.pathway.name === c.pathwayName);
            const pathwayName = evaluatedPathway?.pathway.name;
            if (evaluatedPathway)
              return (
                <PathwaysListElement
                  evaluatedPathway={evaluatedPathway}
                  callback={callback}
                  criteria={c}
                  selected={pathwayName === selectedPathway}
                  disableSelect={selectedPathway !== undefined}
                  key={pathwayName}
                />
              );
            else
              return <div>An error occured evaluating the pathway criteria. Please try again.</div>;
          })
        ) : (
          <div>Loading Pathways...</div>
        )}
      </div>
    );
  }

  const getSelectedPathway = (): string | undefined => {
    // Get all active CarePlan resource texts
    const carePlanTexts = (resources.filter(r => r.resourceType === 'CarePlan') as CarePlan[])
      .filter(r => r.status === 'active')
      .map(r => r.text?.div);

    // Check to see if any of the pathway names are in carePlanTexts
    const selectedPathway = evaluatedPathways
      .map(p => p.pathway.name)
      .find(n => carePlanTexts.some(text => text?.includes(n)));

    return selectedPathway;
  };

  const selectedPathway = getSelectedPathway();
  return (
    <div className={styles.pathways_list}>
      {service.status === 'loading' ? (
        <div>Loading...</div>
      ) : service.status === 'loaded' ? (
        <div className={styles.container}>
          <div className={styles.pathwayListHeaderContainer}>
            <div className={styles.header_title}>
              <div className={styles.header_title__header}>Explore Pathways</div>
              <div className={styles.header_title__note}>Select pathway below to view details</div>
            </div>
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
          </div>

          {criteria?.length !== 0 && renderList()}
        </div>
      ) : (
        <div>ERROR</div>
      )}
    </div>
  );
};

const PathwaysListElement: FC<PathwaysListElementProps> = ({
  evaluatedPathway,
  criteria,
  callback,
  selected,
  disableSelect
}) => {
  const classes = useStyles();
  const pathway = evaluatedPathway.pathway;
  const pathwayCtx = usePathwayContext();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { patientRecords, setPatientRecords } = usePatientRecords();
  const patient = usePatient().patient as Patient;
  const client = useFHIRClient();

  const chevron: IconProp = isVisible ? faChevronUp : faChevronDown;

  function toggleVisible(): void {
    setIsVisible(!isVisible);
  }

  const pathwayElementClass = selected
    ? clsx(styles.selectedPathwayElement, classes['selected-pathway-element'])
    : clsx(styles.pathwayElement, classes['pathway-element']);
  const titleClass = selected
    ? clsx(styles.title, classes['selected-title'])
    : clsx(styles.title, classes.title);

  // Optional attributes for "Select Pathway" button
  const selectButtonOpts: ButtonHTMLAttributes<HTMLButtonElement> = {};
  if (!disableSelect) {
    selectButtonOpts.className = indexStyles.button;
  } else {
    // Add tooltip to button
    selectButtonOpts.title = 'Only one pathway may be selected at a time';
  }

  return (
    <div className={pathwayElementClass} role={'list'} key={pathway.name}>
      <div
        className={titleClass}
        role={'listitem'}
        onClick={(e): void => {
          pathwayCtx.setEvaluatedPathway(evaluatedPathway, true);
          toggleVisible();
        }}
      >
        <div>{pathway.name}</div>
        {selected && (
          <div>
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
        )}
        <div className={styles.expand}>
          <FontAwesomeIcon icon={chevron} />
        </div>
        <div className={styles.numElements}>{criteria?.matches}</div>
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
                {criteria?.criteriaResultItems.map(c => (
                  <tr key={c.elementName}>
                    <td>{c.elementName}</td>
                    <td>{c.expected}</td>
                    <td className={c.match ? styles.matchingElement : undefined}>{c.actual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              {...selectButtonOpts}
              disabled={disableSelect}
              onClick={(): void => {
                const carePlan = createCarePlan(pathway.name, patient);

                setPatientRecords([...patientRecords, carePlan]);
                client?.create?.(carePlan);
                callback(evaluatedPathway);
              }}
            >
              Select Pathway
            </button>
            <button
              className={indexStyles.button}
              onClick={(): void => {
                callback(evaluatedPathway);
              }}
            >
              View Pathway
            </button>
          </div>
          <div className={styles.pathway}>
            <div style={{ height: '100%', overflow: 'scroll' }}>
              <Graph
                evaluatedPathway={evaluatedPathway}
                interactive={false}
                expandCurrentNode={false}
                updateEvaluatedPathways={pathwayCtx.updateEvaluatedPathways}
              />
            </div>
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
