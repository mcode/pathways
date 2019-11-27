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
const START = 'Start';

/**
 *
 * @param pathway - JSON pathway
 */
export const graphLayout = function(pathway: Pathway): Nodes {
  // function graphLayout(pathway: Pathway): string[][] {
  let nodes = initializeGraph(pathway);
  let graph: string[][] = [];
  graph[0] = [START];
  // console.log(nodes);

  // Set the rank for every node
  let rank = 0;
  do {
    // Iterate over each node on the current level
    for (let stateName of graph[rank]) {
      // Assign all children to the next rank
      assignRankToChildren(nodes, graph, nodes[stateName], rank + 1);
    }

    rank++;

    // To start rank = 0 and graph.length = 1. In each iteration children will be added
    // to the next rank incrementing the length of graph. When there are no new children
    // the graph.length will remain unchanged but the rank would have increased by one.
    // Therefore we stop when the rank and graph length are the same.
  } while (graph.length != rank);

  // console.log(graph);

  // Set the position of nodes within the rank
  nodes[START].horizontalPosition = -1 * (NODE_WIDTH / 2);

  for (rank = 1; rank < graph.length; rank++) {
    // Assign position of all nodes on the current level graph[rank]
    for (let nodeName of graph[rank]) {
      let node = nodes[nodeName];
      if (node.horizontalPosition != undefined) continue;
      if (node.parents.length == 1) {
        let parentName = node.parents[0];
        let parent = nodes[parentName];

        if (parent.children.length % 2 == 1) {
          // Odd number of children: one directly below, others to the side
          let childNode = nodes[parent.children[Math.floor(parent.children.length / 2)]];
          childNode.horizontalPosition = parent.horizontalPosition;
        }
        spreadChildrenEvenly(parent, nodes);
      } else {
        console.log(nodeName + ' is the middle of multiple parents');
        // Multiple Parents: Place the node at the average of parents on higher rank
        // TODO: collect all parents to be next to each other
        let parentsOnHigherRank = node.parents.filter(p => {
          let parentRank = nodes[p].rank;
          if (parentRank != undefined && node.rank != undefined) return parentRank < node.rank;
          else return false;
        });
        let sum = parentsOnHigherRank
          .map(p => nodes[p].horizontalPosition)
          .reduce((a, b) => (a != undefined && b != undefined ? a + b : 0), 0);

        // sum will always be a number for some reason the compiler thinks it could be undefined
        node.horizontalPosition = sum != undefined ? sum / parentsOnHigherRank.length : undefined;
      }
    }
  }

  return nodes;
};

/**
 * Set the horizontal position for child elements of a parent
 *
 * @param parent - the parent Node
 * @param nodes - the Nodes
 */
function spreadChildrenEvenly(parent: Node, nodes: Nodes): void {
  if (parent.children.length <= 1) return;
  let children = parent.children;
  let parentHPos = parent.horizontalPosition === undefined ? 0 : parent.horizontalPosition; // Parent hPos will be defined
  if (children.length % 2 == 1) children.splice(Math.ceil(children.length / 2), 1); // Remove middle element if odd

  for (let i = 0; i < children.length / 2; i++) {
    // Set the left child i from the center
    let childNode = nodes[children[children.length / 2 - i - 1]];
    childNode.horizontalPosition = parentHPos - (i + 1) * NODE_OFFSET;

    // Set the right child i from the center
    childNode = nodes[children[children.length / 2 + i]];
    childNode.horizontalPosition = parentHPos + (i + 1) * NODE_OFFSET;
  }
}

// TODO: use this method
function assignHorizontalPositionToNode(
  nodeName: string,
  position: number,
  nodesInRank: string[],
  nodes: Nodes
): void {
  let node = nodes[nodeName];
  nodesInRank.forEach(otherNodeName => {
    let otherNode = nodes[otherNodeName];
    if (
      otherNodeName !== nodeName &&
      otherNode.horizontalPosition != undefined &&
      nodesOverlap(otherNode, position)
    ) {
      // TODO: get value for shift
      // TODO: check new shift does not interfere with another node
      if (position < otherNode.horizontalPosition) {
        // shift the node left
        position -= 10;
      } else {
        // shift the node right
        position += 10;
      }
    }
  });

  nodes[nodeName].horizontalPosition = position;
}

function nodesOverlap(node: Node, position: number): boolean {
  if (
    node.horizontalPosition != undefined &&
    Math.abs(position - node.horizontalPosition) < NODE_WIDTH + MIN_MARGIN_X
  )
    return true;
  return false;
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

    // If the child is on a higher rank than the parent (node) move subtree rooted at child down
    if (childNode.rank != undefined && node.rank != undefined && childNode.rank < node.rank) {
      console.log('Moving child node ' + child + ' from rank ' + childNode.rank + ' to ' + rank);
      // Remove node from previous rank
      graph[childNode.rank].splice(graph[childNode.rank].indexOf(child), 1);

      // Move this node down
      assignRankToNode(nodes, graph, child, rank);

      // Move all children of this child down
      assignRankToChildren(nodes, graph, childNode, rank + 1);
    } else if (childNode.rank == undefined) assignRankToNode(nodes, graph, child, rank);
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
  console.log('Assigning rank ' + rank + ' to node ' + nodeName);
  try {
    graph[rank].push(nodeName);
  } catch (err) {
    graph[rank] = [nodeName];
  } finally {
    nodes[nodeName].rank = rank;
  }
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

  nodes[START].rank = 0;

  return nodes;
}
