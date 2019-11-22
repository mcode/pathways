/* eslint-disable guard-for-in */
/* eslint-disable max-len */

import { Pathway, State } from 'pathways-model';
import { parenthesizedExpression } from '@babel/types';

interface Node {
  rank: number | undefined;
  horizontalPosition: number | undefined;
  children: string[];
  parents: string[];
}

interface Nodes {
  [key: string]: Node;
}

const NODE_WIDTH = 100;
const NODE_HEIGHT = 25;
const MIN_MARGIN_X = 10;
const NODE_OFFSET = NODE_WIDTH + MIN_MARGIN_X;

/**
 *
 * @param pathway - JSON pathway
 */
// export const graphLayout = function(pathway: Pathway): string[][] {
function graphLayout(pathway: Pathway): string[][] {
  let nodes = initializeGraph(pathway);
  let graph: string[][] = [];
  graph[0] = ['Start'];
  console.log(nodes);

  // Set the rank for every node
  let rank = 0;
  do {
    // Iterate over each node on the current level
    for (let stateName in graph[rank]) {
      // Assign all children to the next rank
      assignRankToChildren(nodes, graph, nodes[stateName], rank + 1);
    }

    rank++;

    // To start rank = 0 and graph.length = 1. In each iteration children will be added
    // to the next rank incrementing the length of graph. When there are no new children
    // the graph.length will remain unchanged but the rank would have increased by one.
    // Therefore we stop when the rank and graph length are the same.
  } while (graph.length != rank);

  console.log(graph);

  let maxNodesPerLevel = 1;
  graph
    .map(l => l.length)
    .forEach(
      nodesInLevel =>
        (maxNodesPerLevel = nodesInLevel > maxNodesPerLevel ? nodesInLevel : maxNodesPerLevel)
    );
  // Set the position of nodes within the rank
  let largestMinValue = 0;
  nodes['Start'].horizontalPosition = -1 * (NODE_WIDTH / 2);

  for (rank = 1; rank < graph.length; rank++) {
    // Assign position of all nodes on the current level graph[rank]
    for (let nodeName in graph[rank]) {
      let node = nodes[nodeName];
      if (node.horizontalPosition != undefined) continue;
      if (node.parents.length == 1) {
        let parentName = node.parents[0];
        let parent = nodes[parentName];
        if (parent.children.length == 1) {
          // Child node is directly below the parent node
          // TODO: include this in the else - it should work
          node.horizontalPosition = parent.horizontalPosition;
        } else {
          // Spread the children evenly below the parent
          if (parent.children.length % 2 == 0) {
            // Even number of children: half the children to left and half to the right
            spreadChildrenEvenly(parent, nodes);
            /*
            for (let i = 0; i < parent.children.length / 2; i++) {
              let childNode = nodes[parent.children[i]];
              childNode.horizontalPosition =
                parent.horizontalPosition - i * (NODE_WIDTH + MIN_MARGIN_X);

              childNode = nodes[parent.children[parent.children.length / 2 + i]];
              childNode.horizontalPosition =
                parent.horizontalPosition + i * (NODE_WIDTH + MIN_MARGIN_X);
            }
            */
          } else {
            // Odd number of children: one directly below, others to the side
            // let middleChildIndex = Math.ceil(parent.children.length / 2);
            let childNode = nodes[parent.children[Math.ceil(parent.children.length / 2)]];
            childNode.horizontalPosition = parent.horizontalPosition;

            // Half the children spread evenly to the left [0, middleChildIndex - 1]
            // Half the children spread evenly to the right [middleChildIndex + 1, parent.children.length]
            spreadChildrenEvenly(parent, nodes);
            /*
            for (let i = 1; i <= middleChildIndex; i++) {
              // Set the left child i from the center
              childNode = nodes[parent.children[middleChildIndex - i]];
              childNode.horizontalPosition =
                parent.horizontalPosition - i * (NODE_WIDTH + MIN_MARGIN_X);

              // Set the right child i from the center
              childNode = nodes[parent.children[middleChildIndex + i]];
              childNode.horizontalPosition =
                parent.horizontalPosition + i * (NODE_WIDTH + MIN_MARGIN_X);
            }
            */
          }
        }
      } else {
        // Place the node at the average of parents nodes
        // TODO: collect all parents to be next to each other
      }
    }
  }

  return graph;
}

/**
 * Set the horizontal position for child elements of a parent
 *
 * @param parent - the parent Node
 * @param nodes - the Nodes
 */
function spreadChildrenEvenly(parent: Node, nodes: Nodes) {
  let children = parent.children;
  let parentHPos = parent.horizontalPosition === undefined ? 0 : parent.horizontalPosition;
  if (children.length % 2 == 1) children.splice(Math.ceil(children.length / 2), 1); // Remove middle element if odd

  for (let i = 0; i < children.length / 2; i++) {
    // Set the left child i from the center
    let childNode = nodes[children[children.length / 2 - i - 1]];
    childNode.horizontalPosition = parentHPos - i * NODE_OFFSET;

    // Set the right child i from the center
    childNode = nodes[children[children.length / 2 + i]];
    childNode.horizontalPosition = parentHPos + i * NODE_OFFSET;
  }
}

/**
 * Assigns the rank to every child of node. If the child has a lower rank the entire
 * subtree rooted at that child will be shifted down by recursively assigning rank to
 * the children.
 *
 * @param nodes - the Nodes
 * @param graph - the graph as list of states by level
 * @param node - the node to get children from
 * @param rank - the rank to assign to the children
 */
function assignRankToChildren(nodes: Nodes, graph: string[][], node: Node, rank: number): void {
  node.children.forEach(child => {
    let childNode = nodes[child];

    // If the child is on a higher rank move subtree rooted at child down
    if (childNode.rank != undefined && childNode.rank < rank) {
      // Move this node down
      assignRankToNode(nodes, graph, child, rank);

      // Move all children of this child down
      assignRankToChildren(nodes, graph, childNode, rank + 1);
    }

    assignRankToNode(nodes, graph, child, rank);
    // graph[rank + 1].push(child);
    // nodes[child].rank = rank + 1;
  });
}

/**
 * Assigns the node labeled by stateName the rank by updating graph and nodes data structures
 *
 * @param nodes - the Nodes
 * @param graph - the graph as list of nodes by level
 * @param nodeName - the name of the node to set the rank of
 * @param rank - the new rank for the node
 */
function assignRankToNode(nodes: Nodes, graph: string[][], nodeName: string, rank: number): void {
  graph[rank].push(nodeName);
  nodes[nodeName].rank = rank;
}

/**
 * Initialize the Nodes data structure for the graph representation
 * @param pathway - JSON Pathway
 */
function initializeGraph(pathway: Pathway): Nodes {
  let nodes: Nodes = {};

  // Iniitalize each node with default values
  let stateName: string;
  for (stateName in pathway.states) {
    nodes[stateName] = {
      rank: undefined,
      horizontalPosition: undefined,
      children: [],
      parents: []
    };
  }

  // Set the child and parent properties of each node
  for (stateName in pathway.states) {
    let state: State = pathway.states[stateName];
    state.transitions.forEach(transition => {
      nodes[stateName].children.push(transition.transition);
      nodes[transition.transition].parents.push(stateName);
    });
    // nodes[stateName].children = state.transitions.map(transition => transition.transition);
  }

  return nodes;
}
