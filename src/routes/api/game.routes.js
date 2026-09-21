const express = require('express');
const router = express.Router();
const { getPublicStages, getStageAnswer } = require('../../stages/stageDefinitions');
const recipesData = require('../../data/recipes');
const ingredientsData = require('../../data/ingredients');

// GET /api/stages — stage descriptions for the client (solutions are never included)
router.get('/stages', (req, res) => {
  res.json({ data: getPublicStages() });
});

// GET /api/stages/:id/answer — the solution for one stage, only fetched when the player clicks "Stuck?"
router.get('/stages/:id/answer', (req, res) => {
  const answer = getStageAnswer(req.params.id);
  if (!answer) return res.status(404).json({ error: `Stage "${req.params.id}" not found.` });
  res.json({ data: answer });
});

// POST /api/reset — restore the in-memory data to its initial state
router.post('/reset', (req, res) => {
  recipesData.reset();
  ingredientsData.reset();
  res.json({ message: 'Data restored to its initial state.' });
});

module.exports = router;
