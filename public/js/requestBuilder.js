const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

function populateMethodSelect(selectEl) {
  selectEl.innerHTML = '';
  METHODS.forEach((method) => {
    const option = document.createElement('option');
    option.value = method;
    option.textContent = method;
    selectEl.appendChild(option);
  });
}

function createKeyValueRow({ keyPlaceholder, valuePlaceholder, onChange }) {
  const row = document.createElement('div');
  row.className = 'kv-row';

  const keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.placeholder = keyPlaceholder;
  keyInput.className = 'kv-key';
  keyInput.setAttribute('aria-label', keyPlaceholder);
  keyInput.spellcheck = false;

  const valueInput = document.createElement('input');
  valueInput.type = 'text';
  valueInput.placeholder = valuePlaceholder;
  valueInput.className = 'kv-value';
  valueInput.setAttribute('aria-label', valuePlaceholder);
  valueInput.spellcheck = false;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'kv-row__remove';
  removeBtn.textContent = '×';
  removeBtn.setAttribute('aria-label', 'Remove parameter');
  removeBtn.addEventListener('click', () => {
    row.remove();
    if (onChange) onChange();
  });

  if (onChange) {
    keyInput.addEventListener('input', onChange);
    valueInput.addEventListener('input', onChange);
  }

  row.appendChild(keyInput);
  row.appendChild(valueInput);
  row.appendChild(removeBtn);
  return row;
}

function createQueryRow(onChange) {
  return createKeyValueRow({ keyPlaceholder: 'key', valuePlaceholder: 'value', onChange });
}

function createRouteRow(onChange) {
  return createKeyValueRow({ keyPlaceholder: 'name', valuePlaceholder: 'value', onChange });
}

function readRows(rowsEl) {
  const pairs = [];
  rowsEl.querySelectorAll('.kv-row').forEach((row) => {
    const key = row.querySelector('.kv-key').value.trim();
    const value = row.querySelector('.kv-value').value.trim();
    if (key) pairs.push([key, value]);
  });
  return pairs;
}

function collectQueryString(queryRowsEl) {
  const params = new URLSearchParams(readRows(queryRowsEl));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

// Replaces :name placeholders in the path with the values from the route-parameter rows.
// Returns { path, missing } where `missing` lists placeholders that have no value.
function applyRouteParams(rawPath, routeRowsEl) {
  const values = new Map(readRows(routeRowsEl).map(([k, v]) => [k.replace(/^:/, ''), v]));
  const missing = [];
  const path = rawPath.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, (match, name) => {
    const value = values.get(name);
    if (value === undefined || value === '') {
      missing.push(name);
      return match;
    }
    return encodeURIComponent(value);
  });
  return { path, missing };
}
