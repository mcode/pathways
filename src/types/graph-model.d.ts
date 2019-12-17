declare module 'graph-model' {
  export interface Node {
    label: string;
    rank: number;
    horizontalPosition: number;
    children: string[];
    parents: string[];
    canMove: boolean;
  }

  export interface Nodes {
    [key: string]: Node;
  }

  export interface Layout {
    coordinates: Coordinates;
    edges: Edges;
  }

  export interface Coordinates {
    [key: string]: Coordinate;
  }

  export interface Coordinate {
    x: number;
    y: number;
  }

  export interface Edges {
    [key: string]: Edge;
  }

  export interface Edge {
    points: Array<Coordinate>;
  }

  export interface ExpandedNodes {
    [key: string]: {
      width: number;
      height: number;
    };
  }
}
