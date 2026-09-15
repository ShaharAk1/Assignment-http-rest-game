// SERVER-ONLY answer key. Never import this from anything under public/.
const stages = [
  {
    id: 1,
    method: 'GET',
    pathPattern: /^\/api\/recipes$/,
    successMessage: 'Correct! A simple GET request returns the full list as JSON.',
    hintMessage: 'Try a GET request to /api/recipes with no extra parameters.',
  },
];

function getStageDefinition(stageId) {
  const id = Number(stageId);
  return stages.find((s) => s.id === id);
}

function getStageCount() {
  return stages.length;
}

module.exports = { getStageDefinition, getStageCount };
