import React from 'react';
import { Graphviz } from 'graphviz-react';

// import { usePatient } from './PatientProvider';

import { pathways } from '../engine/index';

import dummyPathway from '../__test__/fixtures/sample_pathway.json';

const Graph = (props) => {
 
    const pathway = (props && props.pathway) || dummyPathway;

    let dot;

    const patient = { resourceType: 'Bundle', entry: props.resources.map(r => ({ resource: r })) }; // fake bundle for the CQL engine

    if (patient.entry.length > 0) {
      const pathwayResults = pathways(pathway, patient);
      dot = generateDOT(pathway, pathwayResults.path);
    }

    return (
      <div>
        {dot ?
          <Graphviz dot={dot} 
            options={{
              fit: true,
              height: 1000,
              width:1000,
              zoom: true
            }}
          />:
          <span>loading...</span>
        }

      </div>
    );
  };

const generateDOT = (pathway, patientPath) => {
  let graphNodes = generateNodes(pathway, patientPath);
  let graphTransitions = generateTransitions(pathway, patientPath);
  
  let graph = "digraph G {";
  graph += graphNodes;
  graph += graphTransitions;
  graph += "}";
  
  return graph;
}
  
/**
 * Create the DOT nodes from the pathway states
 * @param {Object} pathway - pathway JSON
 * @param {list} patientPath - the path the patient took (list of strings)
 * @return string of the nodes in DOT syntax
 */
const generateNodes = (pathway, patientPath) => {
  let pathwayStates = Object.keys(pathway.states);

  return pathwayStates
    .map(state => {
    // Create a JSON object of the node
    console.log(state);
    let node = {
      id: state,
      shape: "record",
      style: "rounded,filled",
      fillcolor: patientPath.includes(state) ? "Grey" : "White",
      penwidth: patientPath.includes(state) ? 2 : 1,
      fontcolor: "Black",
      label: pathway.states[state].label
    };
  
    // Convert the JSON into DOT syntax
    let nodeParams = Object.keys(node)
      .map(key => `${key} = "${node[key]}"`)
      .join(", ");
  
    let nodeAsDOT = '"' + state + '" [' + nodeParams + "]";
    return nodeAsDOT;
    })
    .join("\n");
}

/**
 * Create the DOT transitions from the pathway details
 * @param {Object} pathway - pathway JSON
 * @param {list} patientPath - the path the patient took (list of strings)
 * @return string of the tranistions in DOT synatx
 */
const generateTransitions = (pathway, patientPath) => {
  let pathwayStates = Object.keys(pathway.states);
  
  return pathwayStates
    .map(fromStateName => {
    let fromState = pathway.states[fromStateName];
    let transitions = fromState.transitions;
  
    return transitions
      .map(transition => {
      let toStateName = transition.transition;
      let transitionData = {
        id: fromStateName + "_" + toStateName,
        label: transition.hasOwnProperty("condition")
        ? transition.condition.description
        : "",
        penwidth: isPatientTransition(
        fromStateName,
        toStateName,
        patientPath
        )
        ? 2
        : 1
      };
  
      let transitionParams = Object.keys(transitionData)
        .map(key => `${key} = "${transitionData[key]}"`)
        .join(", ");
  
      let transitionAsDOT =
        '"' +
        fromStateName +
        '" -> "' +
        toStateName +
        '" [' +
        transitionParams +
        "]";
      return transitionAsDOT;
      })
      .join("\n");
    })
    .join("\n");
}
  
/**
 * Helper function to determine if the patient took the transition
 * @param {string} fromStateName - the initial state
 * @param {string} toStateName - the connecting state
 * @param {list} patientPath - the path the patient took (list of strings)
 * @return true if the patient moved *directly* from the fromStateName to toStateName
 */
const isPatientTransition = (fromStateName, toStateName, patientPath) => {
  if (
    patientPath.includes(fromStateName) &&
    patientPath.includes(toStateName)
  ) {
    // Check transition is direct
    let i = patientPath.indexOf(fromStateName);
    return patientPath[i + 1] === toStateName;
  } else return false;
}


export default Graph;
