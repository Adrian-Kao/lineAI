export function isMazeSolved(evidence) {
  return evidence?.reachedGoal === true && Number.isInteger(evidence.moves) && evidence.moves > 0
}
