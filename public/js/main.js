document.addEventListener('DOMContentLoaded', () => {
  let progress = loadProgress();
  let activeStageId = Math.min(progress.currentStage, STAGES.length) || 1;

  const stageIndicator = document.getElementById('stage-indicator');
  const scoreIndicator = document.getElementById('score-indicator');
  const stageNav = document.getElementById('stage-nav');
  const stageTitleEl = document.getElementById('stage-title');
  const stageDescriptionEl = document.getElementById('stage-description');
  const methodSelect = document.getElementById('method-select');
  const pathInput = document.getElementById('path-input');
  const queryBuilder = document.getElementById('query-builder');
  const queryRows = document.getElementById('query-rows');
  const addQueryRowBtn = document.getElementById('add-query-row-btn');
  const bodyBuilder = document.getElementById('body-builder');
  const bodyInput = document.getElementById('body-input');
  const sendBtn = document.getElementById('send-request-btn');
  const statusBadge = document.getElementById('status-badge');
  const resultMessage = document.getElementById('result-message');
  const responseBody = document.getElementById('response-body');
  const resetBtn = document.getElementById('reset-progress-btn');

  function currentStage() {
    return STAGES.find((s) => s.id === activeStageId);
  }

  function renderHeader() {
    stageIndicator.textContent = `Stage ${activeStageId} of ${STAGES.length}`;
    scoreIndicator.textContent = `Score: ${progress.score}`;
  }

  function renderStageNav() {
    stageNav.innerHTML = '';
    STAGES.forEach((stage) => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'stage-pill';
      pill.textContent = String(stage.id);

      const isCompleted = progress.completedStageIds.includes(stage.id);
      const isUnlocked = isCompleted || stage.id <= progress.currentStage;

      if (isCompleted) pill.classList.add('stage-pill-completed');
      if (stage.id === activeStageId) pill.classList.add('stage-pill-active');
      if (!isUnlocked) pill.disabled = true;

      pill.addEventListener('click', () => {
        if (isUnlocked) {
          activeStageId = stage.id;
          renderStage();
        }
      });

      stageNav.appendChild(pill);
    });
  }

  function renderStage() {
    const stage = currentStage();
    stageTitleEl.textContent = `${stage.id}. ${stage.title}`;
    stageDescriptionEl.textContent = stage.description;

    populateMethodSelect(methodSelect);
    pathInput.value = '';
    pathInput.placeholder = stage.pathPlaceholder;

    queryRows.innerHTML = '';
    queryBuilder.hidden = !stage.showQuery;
    if (stage.showQuery) {
      queryRows.appendChild(createQueryRow());
    }

    bodyBuilder.hidden = !stage.showBody;
    bodyInput.value = '';
    bodyInput.placeholder = stage.bodyTemplate ? JSON.stringify(stage.bodyTemplate, null, 2) : '{}';

    statusBadge.hidden = true;
    resultMessage.hidden = true;
    responseBody.textContent = '';

    renderHeader();
    renderStageNav();
  }

  function collectBody(stage) {
    if (!stage.showBody) return undefined;
    const raw = bodyInput.value.trim();
    if (!raw) return undefined;
    try {
      return JSON.parse(raw);
    } catch (err) {
      return null; // signals invalid JSON to the caller
    }
  }

  addQueryRowBtn.addEventListener('click', () => {
    queryRows.appendChild(createQueryRow());
  });

  sendBtn.addEventListener('click', async () => {
    const stage = currentStage();
    const method = methodSelect.value;
    const rawPath = pathInput.value.trim() || stage.pathPlaceholder;
    const query = collectQueryString(queryRows);
    const fullPath = rawPath + query;

    let body;
    if (stage.showBody) {
      body = collectBody(stage);
      if (body === null) {
        renderResultMessage(resultMessage, false, 'Request body is not valid JSON.');
        return;
      }
    }

    sendBtn.disabled = true;
    try {
      const { status, data } = await sendRequest({ stageId: activeStageId, method, path: fullPath, body });
      renderStatusBadge(statusBadge, status);
      renderResponseBody(responseBody, data);

      const stageResult = data && data.stage;
      if (stageResult) {
        renderResultMessage(resultMessage, stageResult.correct, stageResult.message);
        progress = recordAttempt(progress, activeStageId, stageResult.correct);
        renderHeader();
        renderStageNav();
      } else {
        renderResultMessage(resultMessage, false, 'No stage feedback received from the server.');
      }
    } catch (err) {
      renderResultMessage(resultMessage, false, 'Network error — is the server running?');
    } finally {
      sendBtn.disabled = false;
    }
  });

  resetBtn.addEventListener('click', () => {
    progress = resetProgress();
    activeStageId = 1;
    renderStage();
  });

  renderStage();
});
