async function sendRequest({ stageId, method, path, body }) {
  const headers = { Accept: 'application/json' };
  if (stageId !== undefined && stageId !== null) {
    headers['X-Stage-Id'] = String(stageId);
  }

  const options = { method, headers };
  if (body !== undefined && method !== 'GET' && method !== 'DELETE') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(path, options);
  let data = null;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  return { status: response.status, data };
}

async function fetchStages() {
  const { status, data } = await sendRequest({ method: 'GET', path: '/api/stages' });
  if (status !== 200 || !data || !Array.isArray(data.data)) {
    throw new Error('Could not load stages.');
  }
  return data.data;
}

async function fetchStageAnswer(stageId) {
  const { status, data } = await sendRequest({ method: 'GET', path: `/api/stages/${stageId}/answer` });
  if (status !== 200 || !data || !data.data) {
    throw new Error('Could not load the answer.');
  }
  return data.data;
}

async function resetServerData() {
  const { status } = await sendRequest({ method: 'POST', path: '/api/reset' });
  return status === 200;
}
