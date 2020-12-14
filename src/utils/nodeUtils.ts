import { PathwayNode } from 'pathways-model';

export function isActionNode(node: PathwayNode): boolean {
  return node.type === 'action';
}

export function isBranchNode(node: PathwayNode): boolean {
  return node.type === 'branch';
}
