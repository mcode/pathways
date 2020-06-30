import { PathwayNode, GuidanceNode } from 'pathways-model';

export function isGuidanceNode(node: PathwayNode): boolean {
  const { action } = node as GuidanceNode;
  return action ? action.length > 0 : false;
}

export function isBranchNode(node: PathwayNode): boolean {
  return !isGuidanceNode(node) && node.transitions.length > 1;
}
