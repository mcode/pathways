import { PathwayNode, ActionNode } from 'pathways-model';

export function isActionNode(node: PathwayNode): boolean {
  const { action } = node as ActionNode;
  return action ? action.length > 0 : false;
}

export function isBranchNode(node: PathwayNode): boolean {
  return !isActionNode(node) && node.transitions.length > 1;
}
