async function sendRequest({ stageId, method, path, body }) {
  const headers = { 'Content-Type': 'application/json' };
  if (stageId !== undefined && stageId !== null) {
    headers['X-Stage-Id'] = String(stageId);
  }

  const options = { method, headers };
  if (body !== undefined && method !== 'GET' && method !== 'DELETE') {
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
