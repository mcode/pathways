import { State, GuidanceState } from 'pathways-model';

export function isGuidanceState(state: State): boolean {
  const { action } = state as GuidanceState;
  return action ? action.length > 0 : false;
}

export function isBranchState(state: State): boolean {
  return !isGuidanceState(state) && state.transitions.length > 1;
}
