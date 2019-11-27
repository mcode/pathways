/* eslint-disable guard-for-in */
/* eslint-disable max-len */

import { Pathway, State } from 'pathways-model';
import { Node, Nodes, Coordinates } from 'graph-model';

export class Graph {
  private nodes: Nodes;
  private graph: string[][];
  private START = 'Start';
  private NODE_WIDTH = 100;
  private NODE_HEIGHT = 50;
  private MIN_MARGIN_X = 10;
  private MIN_MARGIN_Y = 50;
  private HORIZONTAL_OFFSET = this.NODE_WIDTH + this.MIN_MARGIN_X;
  private VERTICAL_OFFSET = this.NODE_HEIGHT + this.MIN_MARGIN_Y;

  constructor(pathway: Pathway) {
    this.graph = [];
    this.graph[0] = [this.START];
    this.nodes = this.initializeNodes(pathway);
  }

  /**
   * Obtain the graph layout for the pathway as coordinates for every node
   *
   * @param pathway - JSON pathway
   */
  public layout(): Coordinates {
    // Set the rank for every node
    let rank = 0;
    do {
      // Iterate over each node on the current level
      for (let nodeName of this.graph[rank]) {
        // Assign all children to the next rank
        this.assignRankToChildren(this.nodes[nodeName], rank + 1);
      }

      rank++;

      // To start rank = 0 and graph.length = 1. In each iteration children will be added
      // to the next rank incrementing the length of graph. When there are no new children
      // the graph.length will remain unchanged but the rank would have increased by one.
      // Therefore we stop when the rank and graph length are the same.
    } while (this.graph.length != rank);

    // Set the position of nodes within the rank
    this.assignHorizontalPositionToNode(this.nodes[this.START], -1 * (this.NODE_WIDTH / 2));
    for (rank = 1; rank < this.graph.length; rank++) {
      // Assign position of all nodes on the current level graph[rank]
      for (let nodeName of this.graph[rank]) {
        let node = this.nodes[nodeName];
        if (node.horizontalPosition != undefined) continue;
        // TODO: should this be parents on higher rank?
        if (node.parents.length == 1) {
          let parentName = node.parents[0];
          let parent = this.nodes[parentName];

          if (parent.children.length % 2 == 1) {
            // Odd number of children: one directly below, others to the side
            let childNode = this.nodes[parent.children[Math.floor(parent.children.length / 2)]];
            this.assignHorizontalPositionToNode(childNode, parent.horizontalPosition);
          }
          this.spreadChildrenEvenly(parent);
        } else {
          // Multiple Parents: Place the node at the average of parents on higher rank
          // TODO: collect all parents to be next to each other
          let parentsOnHigherRank = node.parents.filter(p => {
            let parentRank = this.nodes[p].rank;
            if (parentRank != undefined && node.rank != undefined) return parentRank < node.rank;
            else return false;
          });
          let sum = parentsOnHigherRank
            .map(p => this.nodes[p].horizontalPosition)
            .reduce((a, b) => (a != undefined && b != undefined ? a + b : 0), 0);

          // sum will always be a number for some reason the compiler thinks it could be undefined
          this.assignHorizontalPositionToNode(
            node,
            sum != undefined ? sum / parentsOnHigherRank.length : undefined
          );
        }
      }
    }

    // console.log(this.nodes);

    return this.produceCoordinates();
  }

  /**
   * Convert the Nodes into a Coordinates object
   *
   * @returns Coordinates for every node
   */
  private produceCoordinates(): Coordinates {
    let coordinates: Coordinates = {};

    for (let nodeName in this.nodes) {
      let node = this.nodes[nodeName];
      coordinates[nodeName] = {
        x: node.horizontalPosition == undefined ? 0 : node.horizontalPosition, // hPos will be defined
        y: node.rank == undefined ? 0 : node.rank * this.VERTICAL_OFFSET // rank will be defined
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
  private spreadChildrenEvenly(parent: Node): void {
    let children = parent.children.filter(
      c => this.nodes[c].horizontalPosition == undefined || this.nodes[c].canMove
    );
    if (children.length == 0) return;
    if (children.length == 1) {
      this.assignHorizontalPositionToNode(this.nodes[children[0]], parent.horizontalPosition);
      return;
    }
    let parentHPos = parent.horizontalPosition === undefined ? 0 : parent.horizontalPosition; // Parent hPos will be defined
    if (children.length % 2 == 1) children.splice(Math.ceil(children.length / 2), 1); // Remove middle element if odd

    // TODO: this does not consider if there are connections between the children which order to put them in
    for (let i = 0; i < children.length / 2; i++) {
      // Set the left child i from the center
      let childNode = this.nodes[children[children.length / 2 - i - 1]];
      this.assignHorizontalPositionToNode(childNode, parentHPos - (i + 1) * this.HORIZONTAL_OFFSET);
      childNode.canMove = false;

      // Set the right child i from the center
      childNode = this.nodes[children[children.length / 2 + i]];
      this.assignHorizontalPositionToNode(childNode, parentHPos + (i + 1) * this.HORIZONTAL_OFFSET);
      childNode.canMove = false;
    }
  }

  /**
   * Assigns the node given by nodeName the horizontal position hPos if it is not already set
   * @param node - the node to set the horizontal position of
   * @param hPos - the horizontal position for the node
   */
  private assignHorizontalPositionToNode(node: Node, hPos: number | undefined): void {
    if (node.horizontalPosition == undefined || node.canMove) {
      node.horizontalPosition = hPos;

      // Check the new position is not on top of another node
      if (node.horizontalPosition == undefined) return;
      let rank = node.rank == undefined ? 0 : node.rank;
      let i = 1;
      while (
        this.graph[rank]
          .map(nodeName => this.nodes[nodeName])
          .every(n => !this.nodesOverlap(node, n))
      ) {
        console.log('Nodes overlap!');
        // Update Horizontal position of this node
        // Alternate directions moving further and further away
        let direction = i % 2 == 0 ? -1 : 1;
        node.horizontalPosition += direction * Math.ceil(i / 2) * this.HORIZONTAL_OFFSET;
        i += 1;

        // Give up...
        if (i > 10) break;
      }
    }
  }

  /**
   * Helper function to determine if two nodes are in the same slot
   *
   * @param node - the first node
   * @param otherNode - the second node
   * @returns true if the nodes share same rank and position, false otherwise
   */
  private nodesOverlap(node: Node, otherNode: Node): boolean {
    return (
      node.rank != undefined &&
      node.horizontalPosition != undefined &&
      node.rank == otherNode.rank &&
      node.horizontalPosition == otherNode.horizontalPosition
    );
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
  private assignRankToChildren(node: Node, rank: number): void {
    node.children.forEach(child => {
      let childNode = this.nodes[child];

      // If the child is on a higher rank than the parent (node) move subtree rooted at child down
      if (childNode.rank != undefined && node.rank != undefined && childNode.rank < node.rank) {
        // console.log('Moving child node ' + child + ' from rank ' + childNode.rank + ' to ' + rank);
        // Remove node from previous rank
        this.graph[childNode.rank].splice(this.graph[childNode.rank].indexOf(child), 1);

        // Move this node down
        this.assignRankToNode(child, rank);

        // Move all children of this child down
        this.assignRankToChildren(childNode, rank + 1);
      } else if (childNode.rank == undefined) this.assignRankToNode(child, rank);
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
  private assignRankToNode(nodeName: string, rank: number): void {
    try {
      this.graph[rank].push(nodeName);
    } catch (err) {
      this.graph[rank] = [nodeName];
    } finally {
      this.nodes[nodeName].rank = rank;
    }
  }

  /**
   * Initialize the Nodes data structure for the graph representation
   * @param pathway - JSON Pathway
   */
  private initializeNodes(pathway: Pathway): Nodes {
    let nodes: Nodes = {};

    // Iniitalize each node with default values
    let stateName: string;
    for (stateName in pathway.states) {
      nodes[stateName] = {
        rank: undefined,
        horizontalPosition: undefined,
        children: [],
        parents: [],
        canMove: true
      };
    }

    // Set the child and parent properties of each node
    for (stateName in pathway.states) {
      let state: State = pathway.states[stateName];
      state.transitions.forEach(transition => {
        if (!nodes[stateName].children.includes(transition.transition))
          nodes[stateName].children.push(transition.transition);
        if (!nodes[transition.transition].parents.includes(stateName))
          nodes[transition.transition].parents.push(stateName);
      });
    }

    nodes[this.START].rank = 0;

    return nodes;
  }
}
