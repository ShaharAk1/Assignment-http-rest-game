const { getStageDefinition } = require('./stageDefinitions');

function normalizePath(req) {
  const pathname = req.originalUrl.split('?')[0];
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function checkQuery(expected, actual) {
  const expectedKeys = Object.keys(expected);
  const actualKeys = Object.keys(actual);
  if (actualKeys.length !== expectedKeys.length) return false;
  return expectedKeys.every((key) => key in actual && expected[key](actual[key]));
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// Feedback names WHICH part of the request is wrong, never what the right value is.
const FEEDBACK = {
  method: 'The HTTP method does not fit this action. Think about what the request should do to the resource.',
  path: 'The path does not point to the right resource. Check the resource name and any route parameters.',
  query: 'The query parameters are not right — check their names, values, and that there are no extras.',
  body: 'The request body does not match the scenario. Check field names, values and JSON types.',
  status: 'The request reached the right place, but the server did not answer with the status code this scenario expects.',
};

function gradeRequest(stageId, req, statusCode) {
  const stage = getStageDefinition(stageId);
  if (!stage) {
    return { stageId: Number(stageId) || null, correct: false, message: `Unknown stage id "${stageId}".`, checks: {} };
  }

  const { solution } = stage;
  const body = isPlainObject(req.body) ? req.body : {};

  const checks = {
    method: req.method === solution.method,
    path: normalizePath(req) === solution.path,
    query: checkQuery(solution.query || {}, req.query || {}),
  };
  if (solution.body) {
    checks.body = solution.body(body);
  }
  checks.status = statusCode === solution.status;

  const firstFailure = Object.keys(checks).find((key) => !checks[key]);
  return {
    stageId: stage.id,
    correct: !firstFailure,
    message: firstFailure ? FEEDBACK[firstFailure] : stage.successMessage,
    checks,
  };
}

// Grades the ACTUAL request the server received (method/path/query/body),
// never a client-reported description of it. Mounted on /api before the routers
// so it can wrap res.json and inject the verdict into the same response —
// including 404s for unknown routes and error responses.
function stageGrader(req, res, next) {
  const stageId = req.header('X-Stage-Id');
  if (!stageId) {
    return next();
  }
  const originalJson = res.json.bind(res);
  res.json = (payload) => {
    const stageResult = gradeRequest(stageId, req, res.statusCode);
    const wrapped = isPlainObject(payload) ? { ...payload, stage: stageResult } : { data: payload, stage: stageResult };
    return originalJson(wrapped);
  };
  next();
}

module.exports = { stageGrader, gradeRequest };
