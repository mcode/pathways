import React, { FC, useState } from 'react';
import { Graphviz } from 'graphviz-react';

// import { usePatient } from './PatientProvider';

import { evaluatePatientOnPathway } from '../engine';
import dummyPathway from '../__tests__/fixtures/sample_pathway.json';
import { Pathway, Transition } from 'pathways-model';

interface GraphProps {
  pathway?: Pathway;
  resources: Array<any>;
}

const Graph: FC<GraphProps> = ({ pathway = dummyPathway, resources }) => {
  const [dot, setDot] = useState<string | undefined>(undefined);

  // fake bundle for the CQL engine
  const patient = { resourceType: 'Bundle', entry: resources.map(r => ({ resource: r })) };

  if (!dot && patient.entry.length > 0) {
    evaluatePatientOnPathway(patient, pathway).then(pathwayResults => {
      setDot(generateDOT(pathway, pathwayResults.path));
    });
  }

  return (
    <div>
      {dot ? (
        <Graphviz
          dot={dot}
          options={{
            fit: true,
            height: 1000,
            width: 1000,
            zoom: true
          }}
        />
      ) : (
        <span>loading...</span>
      )}
    </div>
  );
};

const generateDOT = (pathway: Pathway, patientPath: Array<string>): string => {
  const graphNodes = generateNodes(pathway, patientPath);
  const graphTransitions = generateTransitions(pathway, patientPath);

  return `digraph G {${graphNodes} ${graphTransitions}}`;
};

/**
 * Create the DOT nodes from the pathway states
 * @param pathway - pathway JSON
 * @param patientPath - the path the patient took (list of strings)
 * @return string of the nodes in DOT syntax
 */
const generateNodes = (pathway: Pathway, patientPath: Array<string>): string => {
  const pathwayStates = Object.keys(pathway.states);

  return pathwayStates
    .map(state => {
      // Create a JSON object of the node
      const node = {
        id: state,
        shape: 'record',
        style: 'rounded,filled',
        fillcolor: patientPath.includes(state) ? 'Grey' : 'White',
        penwidth: patientPath.includes(state) ? 2 : 1,
        fontcolor: 'Black',
        label: pathway.states[state].label
      };

      // Convert the JSON into DOT syntax
      const nodeParams = (Object.keys(node) as Array<keyof typeof node>)
        .map(key => `${key} = "${node[key]}"`)
        .join(', ');

      const nodeAsDOT = '"' + state + '" [' + nodeParams + ']';
      return nodeAsDOT;
    })
    .join('\n');
};

/**
 * Create the DOT transitions from the pathway details
 * @param pathway - pathway JSON
 * @param patientPath - the path the patient took (list of strings)
 * @return string of the tranistions in DOT synatx
 */
const generateTransitions = (pathway: Pathway, patientPath: Array<string>): string => {
  const pathwayStates = Object.keys(pathway.states);

  return pathwayStates
    .map(fromStateName => {
      const fromState = pathway.states[fromStateName];
      const transitions = fromState.transitions;

      return transitions
        .map((transition: Transition) => {
          const toStateName = transition.transition;
          const transitionData = {
            id: fromStateName + '_' + toStateName,
            label: 'condition' in transition ? transition.condition!.description : '',
            penwidth: isPatientTransition(fromStateName, toStateName, patientPath) ? 2 : 1
          };

          const transitionParams = (Object.keys(transitionData) as Array<
            keyof typeof transitionData
          >)
            .map(key => `${key} = "${transitionData[key]}"`)
            .join(', ');

          const transitionAsDOT =
            '"' + fromStateName + '" -> "' + toStateName + '" [' + transitionParams + ']';
          return transitionAsDOT;
        })
        .join('\n');
    })
    .join('\n');
};

/**
 * Helper function to determine if the patient took the transition
 * @param fromStateName - the initial state
 * @param toStateName - the connecting state
 * @param patientPath - the path the patient took (list of strings)
 * @return true if the patient moved *directly* from the fromStateName to toStateName
 */
const isPatientTransition = (
  fromStateName: string,
  toStateName: string,
  patientPath: Array<string>
): boolean => {
  if (patientPath.includes(fromStateName) && patientPath.includes(toStateName)) {
    // Check transition is direct
    const i = patientPath.indexOf(fromStateName);
    return patientPath[i + 1] === toStateName;
  } else return false;
};

export default Graph;
