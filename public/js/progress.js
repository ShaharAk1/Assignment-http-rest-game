const PROGRESS_KEY = 'httpGameProgress';

function defaultProgress() {
  return { currentStage: 1, completedStageIds: [], attemptsPerStage: {}, revealedStageIds: [], score: 0 };
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw);
    return Object.assign(defaultProgress(), parsed);
  } catch (err) {
    return defaultProgress();
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (err) {
    // localStorage unavailable (private browsing, etc.) — progress just won't persist.
  }
}

function recordAttempt(progress, stageId, wasCorrect) {
  const priorAttempts = progress.attemptsPerStage[stageId] || 0;
  progress.attemptsPerStage[stageId] = priorAttempts + 1;

  if (wasCorrect && !progress.completedStageIds.includes(stageId)) {
    progress.completedStageIds.push(stageId);
    if (!progress.revealedStageIds.includes(stageId)) progress.score += priorAttempts === 0 ? 10 : 5;
    progress.currentStage = Math.max(progress.currentStage, stageId + 1);
  }

  saveProgress(progress);
  return progress;
}

function recordReveal(progress, stageId) {
  if (!progress.revealedStageIds.includes(stageId)) progress.revealedStageIds.push(stageId);
  saveProgress(progress);
  return progress;
}

function resetProgress() {
  const fresh = defaultProgress();
  saveProgress(fresh);
  return fresh;
}
