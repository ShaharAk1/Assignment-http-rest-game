// Every "Stuck?" answer must pass its own stage's grader.
const test = require('node:test');
const assert = require('node:assert');
const { getStageCount, getStageDefinition, getStageAnswer } = require('../src/stages/stageDefinitions');
const { gradeRequest } = require('../src/stages/stageGrader');

for (let id = 1; id <= getStageCount(); id++) {
  test(`stage ${id} answer passes the grader`, () => {
    const { request, body } = getStageAnswer(id);
    const [method, url] = request.split(' ');
    const req = {
      method,
      originalUrl: url,
      query: Object.fromEntries(new URL(url, 'http://x').searchParams),
      body: body || {},
      headers: {},
    };
    const result = gradeRequest(id, req, getStageDefinition(id).solution.status);
    assert.ok(result.correct, JSON.stringify(result.checks));
  });
}
