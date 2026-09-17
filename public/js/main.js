document.addEventListener('DOMContentLoaded', async () => {
  let stages = [];
  let progress = loadProgress();
  let activeStageId = 1;

  const stageIndicator = document.getElementById('stage-indicator');
  const xpText = document.getElementById('xp-text');
  const xpFill = document.getElementById('xp-fill');
  const scoreValue = document.getElementById('score-value');
  const scorePop = document.getElementById('score-pop');
  const attemptsValue = document.getElementById('attempts-value');
  const stageNav = document.getElementById('stage-nav');
  const stageNumberEl = document.getElementById('stage-number');
  const stageTitleEl = document.getElementById('stage-title');
  const completedBadge = document.getElementById('stage-completed-badge');
  const conceptsEl = document.getElementById('stage-concepts');
  const stageDescriptionEl = document.getElementById('stage-description');
  const methodSelect = document.getElementById('method-select');
  const pathInput = document.getElementById('path-input');
  const routeBuilder = document.getElementById('route-builder');
  const routeRows = document.getElementById('route-rows');
  const addRouteRowBtn = document.getElementById('add-route-row-btn');
  const queryBuilder = document.getElementById('query-builder');
  const queryRows = document.getElementById('query-rows');
  const addQueryRowBtn = document.getElementById('add-query-row-btn');
  const bodyBuilder = document.getElementById('body-builder');
  const bodyInput = document.getElementById('body-input');
  const requestPreview = document.getElementById('request-preview');
  const builderError = document.getElementById('builder-error');
  const sendBtn = document.getElementById('send-request-btn');
  const responsePanel = document.getElementById('response-panel');
  const responsePlaceholder = document.getElementById('response-placeholder');
  const statusBadge = document.getElementById('status-badge');
  const resultMessage = document.getElementById('result-message');
  const checkList = document.getElementById('check-list');
  const nextStageBtn = document.getElementById('next-stage-btn');
  const responseBody = document.getElementById('response-body');
  const resetProgressBtn = document.getElementById('reset-progress-btn');
  const resetDataBtn = document.getElementById('reset-data-btn');
  const winScreen = document.getElementById('win-screen');
  const winScore = document.getElementById('win-score');
  const winCloseBtn = document.getElementById('win-close-btn');
  const winRestartBtn = document.getElementById('win-restart-btn');
  const confetti = document.getElementById('confetti');

  function currentStage() {
    return stages.find((s) => s.id === activeStageId);
  }

  function stageUses(stage, input) {
    return stage.inputs.includes(input);
  }

  function isCompleted(stageId) {
    return progress.completedStageIds.includes(stageId);
  }

  function isUnlocked(stageId) {
    return isCompleted(stageId) || stageId <= progress.currentStage;
  }

  function renderHeader() {
    const cleared = progress.completedStageIds.length;
    stageIndicator.textContent = `Stage ${activeStageId} of ${stages.length}`;
    xpText.textContent = `${cleared} / ${stages.length}`;
    xpFill.style.width = `${stages.length ? (cleared / stages.length) * 100 : 0}%`;
    scoreValue.textContent = String(progress.score);
    attemptsValue.textContent = String(progress.attemptsPerStage[activeStageId] || 0);
    completedBadge.hidden = !isCompleted(activeStageId);
  }

  function renderStageNav() {
    stageNav.innerHTML = '';
    stages.forEach((stage) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'level-tile';
      tile.textContent = String(stage.id).padStart(2, '0');

      const completed = isCompleted(stage.id);
      const unlocked = isUnlocked(stage.id);
      tile.title = unlocked ? `${stage.id}. ${stage.title}` : `Stage ${stage.id} (locked)`;
      tile.setAttribute(
        'aria-label',
        `Stage ${stage.id}${completed ? ', cleared' : ''}${unlocked ? '' : ', locked'}`
      );

      if (completed) tile.classList.add('level-tile--completed');
      if (stage.id === activeStageId) {
        tile.classList.add('level-tile--active');
        tile.setAttribute('aria-current', 'step');
      }
      if (!unlocked) tile.disabled = true;

      tile.addEventListener('click', () => goToStage(stage.id));
      stageNav.appendChild(tile);
    });

    const activeTile = stageNav.querySelector('.level-tile--active');
    if (activeTile) activeTile.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  function renderNextButton() {
    const hasNext = activeStageId < stages.length;
    nextStageBtn.hidden = !(isCompleted(activeStageId) && hasNext);
  }

  function clearResponse() {
    responsePlaceholder.hidden = false;
    statusBadge.hidden = true;
    resultMessage.hidden = true;
    checkList.hidden = true;
    responseBody.hidden = true;
    responseBody.textContent = '';
    builderError.hidden = true;
  }

  function goToStage(stageId) {
    if (!isUnlocked(stageId)) return;
    activeStageId = stageId;
    renderStage();
  }

  function setMethod(method) {
    methodSelect.value = method;
    methodSelect.dataset.method = method;
  }

  function renderStage() {
    const stage = currentStage();
    stageNumberEl.textContent = String(stage.id).padStart(2, '0');
    stageTitleEl.textContent = stage.title;
    stageDescriptionEl.textContent = stage.description;
    renderConcepts(conceptsEl, stage.concepts);

    setMethod('GET');
    pathInput.value = '/api/';

    routeRows.innerHTML = '';
    routeBuilder.hidden = !stageUses(stage, 'route');
    if (stageUses(stage, 'route')) routeRows.appendChild(createRouteRow(updatePreview));

    queryRows.innerHTML = '';
    queryBuilder.hidden = !stageUses(stage, 'query');
    if (stageUses(stage, 'query')) queryRows.appendChild(createQueryRow(updatePreview));

    bodyBuilder.hidden = !stageUses(stage, 'body');
    bodyInput.value = stage.bodyTemplate ? JSON.stringify(stage.bodyTemplate, null, 2) : '{\n  \n}';

    clearResponse();
    renderHeader();
    renderStageNav();
    renderNextButton();
    updatePreview();
  }

  function buildRequest() {
    const stage = currentStage();
    const method = methodSelect.value;
    const rawPath = pathInput.value.trim();

    if (!rawPath.startsWith('/')) {
      return { error: 'The path must start with "/".' };
    }
    if (rawPath.includes('?')) {
      return { error: 'Put query parameters in the "Query parameters" section, not in the path.' };
    }

    const { path, missing } = stageUses(stage, 'route')
      ? applyRouteParams(rawPath, routeRows)
      : { path: rawPath, missing: [] };
    if (missing.length > 0) {
      return { error: `Missing a value for route parameter: ${missing.map((m) => ':' + m).join(', ')}` };
    }

    const query = stageUses(stage, 'query') ? collectQueryString(queryRows) : '';

    let body;
    if (stageUses(stage, 'body') && method !== 'GET' && method !== 'DELETE') {
      const raw = bodyInput.value.trim();
      if (raw) {
        try {
          body = JSON.parse(raw);
        } catch (err) {
          return { error: `Request body is not valid JSON: ${err.message}` };
        }
      }
    }

    return { method, fullPath: path + query, body };
  }

  function updatePreview() {
    const request = buildRequest();
    if (request.error) {
      requestPreview.textContent = `${methodSelect.value} ${pathInput.value.trim()}`;
      return;
    }
    requestPreview.textContent = `${request.method} ${request.fullPath}`;
  }

  function celebrate(stageId, pointsGained) {
    if (pointsGained > 0) showScorePop(scorePop, pointsGained);
    launchConfetti(confetti, 50);

    const allCleared = progress.completedStageIds.length === stages.length;
    if (allCleared && pointsGained > 0) {
      winScore.textContent = String(progress.score);
      setTimeout(() => {
        winScreen.hidden = false;
        winCloseBtn.focus();
        launchConfetti(confetti, 120);
      }, 900);
    } else if (stageId === activeStageId) {
      nextStageBtn.focus({ preventScroll: true });
    }
  }

  async function handleSend() {
    const request = buildRequest();
    if (request.error) {
      builderError.textContent = request.error;
      builderError.hidden = false;
      replayAnimation(builderError, 'is-shaking');
      return;
    }
    builderError.hidden = true;

    const stageId = activeStageId;
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending…';
    try {
      const { status, data } = await sendRequest({
        stageId,
        method: request.method,
        path: request.fullPath,
        body: request.body,
      });
      if (stageId !== activeStageId) return; // user switched stages while waiting

      responsePlaceholder.hidden = true;
      renderStatusBadge(statusBadge, status);
      renderResponseBody(responseBody, data);

      const stageResult = data && data.stage;
      if (stageResult) {
        const wasCompleted = isCompleted(stageId);
        const scoreBefore = progress.score;

        renderResultMessage(
          resultMessage,
          stageResult.correct ? 'success' : 'error',
          stageResult.correct ? (wasCompleted ? 'Still correct!' : 'Level clear!') : 'Try again!',
          stageResult.message
        );
        renderCheckList(checkList, stageResult.checks);
        progress = recordAttempt(progress, stageId, stageResult.correct);

        renderHeader();
        renderStageNav();
        renderNextButton();

        if (stageResult.correct) {
          celebrate(stageId, progress.score - scoreBefore);
        } else {
          replayAnimation(responsePanel, 'is-shaking');
        }
      } else {
        renderResultMessage(resultMessage, 'error', 'Hmm…', 'No stage feedback received from the server.');
        checkList.hidden = true;
      }
    } catch (err) {
      responsePlaceholder.hidden = true;
      renderResultMessage(resultMessage, 'error', 'Game over?', 'Network error — is the server running?');
      replayAnimation(responsePanel, 'is-shaking');
    } finally {
      sendBtn.disabled = false;
      sendBtn.innerHTML = '<span class="glyph">▶</span> Send request';
    }
  }

  addRouteRowBtn.addEventListener('click', () => {
    routeRows.appendChild(createRouteRow(updatePreview));
  });
  addQueryRowBtn.addEventListener('click', () => {
    queryRows.appendChild(createQueryRow(updatePreview));
  });
  methodSelect.addEventListener('change', () => {
    methodSelect.dataset.method = methodSelect.value;
    updatePreview();
  });
  pathInput.addEventListener('input', updatePreview);
  bodyInput.addEventListener('input', () => {
    builderError.hidden = true;
  });
  sendBtn.addEventListener('click', handleSend);
  pathInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleSend();
  });

  nextStageBtn.addEventListener('click', () => {
    goToStage(activeStageId + 1);
    document.getElementById('main').scrollIntoView({ behavior: 'smooth' });
  });

  function restartGame() {
    progress = resetProgress();
    winScreen.hidden = true;
    goToStage(1);
  }

  resetProgressBtn.addEventListener('click', () => {
    if (!confirm('Reset your score and progress back to stage 1?')) return;
    restartGame();
  });

  winCloseBtn.addEventListener('click', () => {
    winScreen.hidden = true;
  });
  winRestartBtn.addEventListener('click', restartGame);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !winScreen.hidden) winScreen.hidden = true;
  });

  resetDataBtn.addEventListener('click', async () => {
    resetDataBtn.disabled = true;
    try {
      const ok = await resetServerData();
      clearResponse();
      responsePlaceholder.hidden = true;
      renderResultMessage(
        resultMessage,
        ok ? 'info' : 'error',
        ok ? 'Data reset' : 'Reset failed',
        ok ? 'Recipes and ingredients are back to their initial state.' : 'Could not reset the server data.'
      );
    } catch (err) {
      renderResultMessage(resultMessage, 'error', 'Game over?', 'Network error — is the server running?');
    } finally {
      resetDataBtn.disabled = false;
    }
  });

  populateMethodSelect(methodSelect);

  try {
    stages = await fetchStages();
  } catch (err) {
    stageTitleEl.textContent = 'Could not load the game stages. Is the server running?';
    sendBtn.disabled = true;
    return;
  }

  progress.currentStage = Math.min(Math.max(progress.currentStage, 1), stages.length);
  activeStageId = progress.currentStage;
  renderStage();
});
