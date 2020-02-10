/* eslint-disable guard-for-in */
/* eslint-disable max-len */

import { Pathway, State } from 'pathways-model';
import { Node, Nodes, Layout, NodeCoordinates, Edges, NodeDimensions } from 'graph-model';

import dagre from 'dagre';

import config from 'utils/ConfigManager';
const graphLayoutProvider = config.get('graphLayoutProvider', 'dagre');

/**
 * Obtain the graph layout for the pathway as coordinates for every node
 *
 * @param pathway - JSON pathway
 */
export default function layout(pathway: Pathway, nodeDimensions: NodeDimensions): Layout {
  return graphLayoutProvider === 'dagre'
    ? layoutDagre(pathway, nodeDimensions)
    : layoutCustom(pathway);
}

/**
 * Layout the pathway using the Dagre layout engine.
 * @see {@link https://github.com/dagrejs/dagre}
 */
function layoutDagre(pathway: Pathway, nodeDimensions: NodeDimensions): Layout {
  const START = 'Start';
  const NODE_HEIGHT = 50;
  const NODE_WIDTH_FACTOR = 10; // factor to convert label length => width, assume font size roughly 10
  const nodeNames = Object.keys(pathway.states);
  const g = new dagre.graphlib.Graph();

  g.setGraph({});
  g.setDefaultEdgeLabel(() => ({})); // dagre requires a default edge label, we want it to just be empty

  nodeNames.forEach(stateName => {
    const state: State = pathway.states[stateName];
    const nodeDimension = nodeDimensions[stateName];

    if (nodeDimension) {
      g.setNode(stateName, {
        label: state.label,
        width: nodeDimension.width,
        height: nodeDimension.height
      });
    } else {
      g.setNode(stateName, {
        label: state.label,
        width: state.label.length * NODE_WIDTH_FACTOR,
        height: NODE_HEIGHT
      });
    }

    state.transitions.forEach(transition => {
      const label = transition.condition
        ? {
            label: transition.condition.description,
            width: 25,
            height: 20
          }
        : {};

      g.setEdge(stateName, transition.transition, label);
    });
  });

  dagre.layout(g);
  const nodeCoordinates: NodeCoordinates = {};
  const startNodeShift = g.node(START).x;

  for (const nodeName of nodeNames) {
    const node = g.node(nodeName);
    // dagre returns coordinates for the center of the node,
    // our renderer expects coordinates for the corner of the node.
    // further, our renderer expects the Start node to be centered at x: 0
    nodeCoordinates[nodeName] = {
      x: node.x - startNodeShift - node.width / 2,
      y: node.y - node.height / 2
    };
  }

  const edges: Edges = {};

  g.edges().forEach(e => {
    const edge = g.edge(e);
    const edgeName = `${e.v}, ${e.w}`;
    const label = edge.label ? { text: edge.label, x: edge.x - startNodeShift, y: edge.y } : null;

    edges[edgeName] = {
      label,
      start: e.v,
      end: e.w,
      points: edge.points.map(p => {
        return {
          x: p.x - startNodeShift,
          y: p.y
        };
      })
    };
  });

  return { nodeCoordinates, edges };
}

/**
 * Layout the pathway using our homegrown layout algorithm.
 */
function layoutCustom(pathway: Pathway): Layout {
  const START = 'Start';
  const NODE_WIDTH = 100;
  const NODE_HEIGHT = 50;
  const MIN_MARGIN_X = 10;
  const MIN_MARGIN_Y = 50;
  const nodes: Nodes = initializeNodes(pathway);
  const graph: string[][] = [[START]];
  const HORIZONTAL_OFFSET = NODE_WIDTH + MIN_MARGIN_X;
  const VERTICAL_OFFSET = NODE_HEIGHT + MIN_MARGIN_Y;

  // Set the rank for every node
  let rank = 0;
  do {
    // Iterate over each node on the current level
    for (const nodeName of graph[rank]) {
      // Assign all children to the next rank
      assignRankToChildren(nodes[nodeName], rank + 1);
    }

    rank++;

    // To start rank = 0 and graph.length = 1. In each iteration children will be added
    // to the next rank incrementing the length of graph. When there are no new children
    // the graph.length will remain unchanged but the rank would have increased by one.
    // Therefore we stop when the rank and graph length are the same.
  } while (graph.length !== rank);

  // Set the position of nodes within the rank
  assignHorizontalPositionToNode(nodes[START], -1 * (NODE_WIDTH / 2));
  for (rank = 1; rank < graph.length; rank++) {
    assignHorizontalPositionToNodesInRank(rank);
  }

  return {
    nodeCoordinates: produceCoordinates(),
    edges: {}
  };

  /**
   * Convert the Nodes into a Coordinates object
   *
   * @returns Coordinates for every node
   */
  function produceCoordinates(): NodeCoordinates {
    const coordinates: NodeCoordinates = {};

    for (const nodeName in nodes) {
      const node = nodes[nodeName];
      coordinates[nodeName] = {
        x: node.horizontalPosition,
        y: node.rank * VERTICAL_OFFSET
      };
    }

    return coordinates;
  }

  /**
   * Set the horizontal position for child elements of a parent
   *
   * @param parent - the parent Node
   * @param nodes - the Nodes
   */
  function spreadChildrenEvenly(parent: Node): void {
    const children = parent.children.filter(
      c => isNaN(nodes[c].horizontalPosition) || nodes[c].canMove
    );
    if (children.length === 0) return;
    if (children.length === 1) {
      assignHorizontalPositionToNode(nodes[children[0]], parent.horizontalPosition);
      return;
    }
    if (children.length % 2 === 1) children.splice(Math.ceil(children.length / 2), 1); // Remove middle element if odd

    // TODO: this does not consider if there are connections between the children which order to put them in
    for (let i = 0; i < children.length / 2; i++) {
      // Set the left child i from the center
      let childNode = nodes[children[children.length / 2 - i - 1]];
      assignHorizontalPositionToNode(
        childNode,
        parent.horizontalPosition - (i + 1) * HORIZONTAL_OFFSET
      );
      childNode.canMove = false;

      // Set the right child i from the center
      childNode = nodes[children[children.length / 2 + i]];
      assignHorizontalPositionToNode(
        childNode,
        parent.horizontalPosition + (i + 1) * HORIZONTAL_OFFSET
      );
      childNode.canMove = false;
    }
  }

  /**
   * Assigns the node given by nodeName the horizontal position hPos if it is not already set
   * @param node - the node to set the horizontal position of
   * @param hPos - the horizontal position for the node
   */
  function assignHorizontalPositionToNode(node: Node, hPos: number): void {
    if (isNaN(node.horizontalPosition) || node.canMove) {
      node.horizontalPosition = hPos;

      // Check the new position is not on top of another node
      let i = 1;
      while (hasOverlap(node)) {
        // Update Horizontal position of this node
        // Alternate directions moving further and further away
        const direction = i % 2 === 0 ? -1 : 1;
        node.horizontalPosition = hPos + direction * Math.ceil(i / 2) * HORIZONTAL_OFFSET;
        i += 1;
      }
    }
  }

  /**
   * Assigns the horizontal position of all nodes on the current level
   *
   * @param rank - the level of the graph to assign node positions of
   */
  function assignHorizontalPositionToNodesInRank(rank: number): void {
    for (const nodeName of graph[rank]) {
      const node = nodes[nodeName];
      if (!isNaN(node.horizontalPosition)) continue;
      const parentsOnHigherRank = node.parents.filter(p => nodes[p].rank < node.rank);
      if (parentsOnHigherRank.length === 1) {
        const parentName = node.parents[0];
        const parent = nodes[parentName];

        if (parent.children.length % 2 === 1) {
          // Odd number of children: one directly below, others to the side
          const childNode = nodes[parent.children[Math.floor(parent.children.length / 2)]];
          assignHorizontalPositionToNode(childNode, parent.horizontalPosition);
        }
        spreadChildrenEvenly(parent);
      } else {
        // Multiple Parents: Place the node at the average of parents on higher rank
        // TODO: collect all parents to be next to each other
        const sum = parentsOnHigherRank
          .map(p => nodes[p].horizontalPosition)
          .reduce((a, b) => a + b, 0);

        assignHorizontalPositionToNode(node, sum / parentsOnHigherRank.length);
      }
    }
  }

  /**
   * Determines if the node overlaps with any other nodes in the rank
   *
   * @param node - the node to check for overlap with
   * @returns true if the node overlaps with any other node in the rank, false otherwise
   */
  function hasOverlap(node: Node): boolean {
    const nodesInRank = graph[node.rank].map(name => nodes[name]);

    for (const otherNode of nodesInRank) {
      if (nodesOverlap(node, otherNode)) return true;
    }

    return false;
  }

  /**
   * Helper function to determine if two nodes are in the same slot
   *
   * @param node - the first node
   * @param otherNode - the second node
   * @returns true if the nodes share same rank and position, false otherwise
   */
  function nodesOverlap(node: Node, otherNode: Node): boolean {
    if (nodesEqual(node, otherNode)) return false;
    else
      return (
        !isNaN(node.rank) &&
        !isNaN(node.horizontalPosition) &&
        !isNaN(otherNode.rank) &&
        !isNaN(otherNode.horizontalPosition) &&
        node.rank === otherNode.rank &&
        node.horizontalPosition === otherNode.horizontalPosition
      );
  }

  /**
   * Determine if two nodes are the same
   *
   * @param node - the first node
   * @param otherNode - the second node
   * @returns true if the two nodes are the same (have the same label)
   */
  function nodesEqual(node: Node, otherNode: Node): boolean {
    return node.label === otherNode.label;
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
  function assignRankToChildren(node: Node, rank: number): void {
    node.children.forEach(child => {
      const childNode = nodes[child];

      // If the child is on a higher rank than the parent (node) move subtree rooted at child down
      if (childNode.rank < node.rank) {
        // Remove node from previous rank
        graph[childNode.rank].splice(graph[childNode.rank].indexOf(child), 1);

        // Move this node down
        assignRankToNode(child, rank);

        // Move all children of this child down
        assignRankToChildren(childNode, rank + 1);
      } else if (isNaN(childNode.rank)) assignRankToNode(child, rank);
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
  function assignRankToNode(nodeName: string, rank: number): void {
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
   *
   * @param pathway - JSON Pathway
   * @returns initial Nodes data structure with default values
   */
  function initializeNodes(pathway: Pathway): Nodes {
    const nodes: Nodes = {};

    // Iniitalize each node with default values
    let stateName: string;
    for (stateName in pathway.states) {
      nodes[stateName] = {
        label: stateName,
        rank: NaN,
        horizontalPosition: NaN,
        children: [],
        parents: [],
        canMove: true
      };
    }

    // Set the child and parent properties of each node
    Object.keys(pathway.states).forEach(stateName => {
      const state: State = pathway.states[stateName];

      state.transitions.forEach(transition => {
        if (!nodes[stateName].children.includes(transition.transition))
          nodes[stateName].children.push(transition.transition);
        if (!nodes[transition.transition].parents.includes(stateName))
          nodes[transition.transition].parents.push(stateName);
      });
    });

    nodes[START].rank = 0;

    return nodes;
  }
}
