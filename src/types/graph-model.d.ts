declare module 'graph-model' {
  export interface Node {
    rank: number | undefined; // TODO: perhaps set default to -1 instead of undefined?
    horizontalPosition: number | undefined;
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
