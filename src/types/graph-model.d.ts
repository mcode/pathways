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

  export interface Coordinates {
    [key: string]: {
      x: number;
      y: number;
    };
  }
}
