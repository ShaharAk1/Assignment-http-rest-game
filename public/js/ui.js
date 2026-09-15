function renderStatusBadge(el, status) {
  el.hidden = false;
  el.textContent = `Status: ${status}`;
  el.className = 'status-badge';
  if (status >= 200 && status < 300) {
    el.classList.add('status-success');
  } else if (status >= 400 && status < 500) {
    el.classList.add('status-client-error');
  } else if (status >= 500) {
    el.classList.add('status-server-error');
  }
}

function renderResultMessage(el, correct, message) {
  el.hidden = false;
  el.textContent = message;
  el.className = 'result-message ' + (correct ? 'result-success' : 'result-error');
}

function renderResponseBody(el, data) {
  el.textContent = JSON.stringify(data, null, 2);
}
