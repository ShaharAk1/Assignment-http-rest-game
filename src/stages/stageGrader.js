const { getStageDefinition } = require('./stageDefinitions');

function normalizePath(req) {
  const pathname = req.originalUrl.split('?')[0];
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function gradeRequest(stageId, req, statusCode) {
  const stage = getStageDefinition(stageId);
  if (!stage) {
    return { correct: false, message: 'Unknown stage id.' };
  }

  const path = normalizePath(req);
  const methodOk = req.method === stage.method;
  const pathOk = stage.pathPattern.test(path);
  const queryOk = stage.checkQuery ? stage.checkQuery(req.query || {}) : true;
  const bodyOk = stage.checkBody ? stage.checkBody(req.body || {}) : true;
  const statusOk = stage.expectedStatus ? statusCode === stage.expectedStatus : true;

  const correct = methodOk && pathOk && queryOk && bodyOk && statusOk;

  return correct
    ? { correct: true, message: stage.successMessage }
    : { correct: false, message: stage.hintMessage };
}

// Grades the ACTUAL request the server received (method/path/query/body),
// never a client-reported description of it. Mounted before route handlers
// so it can wrap res.json and inject the verdict into the same response.
function stageGrader(req, res, next) {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const stageId = req.header('X-Stage-Id');
    if (!stageId) {
      return originalJson(body);
    }
    const stageResult = gradeRequest(stageId, req, res.statusCode);
    return originalJson({ ...body, stage: stageResult });
  };
  next();
}

module.exports = { stageGrader, gradeRequest };
