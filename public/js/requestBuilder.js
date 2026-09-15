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

function createQueryRow(onRemove) {
  const row = document.createElement('div');
  row.className = 'query-row';

  const keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.placeholder = 'key';
  keyInput.className = 'query-key';

  const valueInput = document.createElement('input');
  valueInput.type = 'text';
  valueInput.placeholder = 'value';
  valueInput.className = 'query-value';

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = '×';
  removeBtn.setAttribute('aria-label', 'Remove parameter');
  removeBtn.addEventListener('click', () => {
    row.remove();
    if (onRemove) onRemove();
  });

  row.appendChild(keyInput);
  row.appendChild(valueInput);
  row.appendChild(removeBtn);
  return row;
}

function collectQueryString(queryRowsEl) {
  const params = new URLSearchParams();
  queryRowsEl.querySelectorAll('.query-row').forEach((row) => {
    const key = row.querySelector('.query-key').value.trim();
    const value = row.querySelector('.query-value').value.trim();
    if (key) params.append(key, value);
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}
