const express = require('express');
const router = express.Router();
const { getPublicStages } = require('../../stages/stageDefinitions');
const recipesData = require('../../data/recipes');
const ingredientsData = require('../../data/ingredients');

// GET /api/stages — stage descriptions for the client (solutions are never included)
router.get('/stages', (req, res) => {
  res.json({ data: getPublicStages() });
});

// POST /api/reset — restore the in-memory data to its initial state
router.post('/reset', (req, res) => {
  recipesData.reset();
  ingredientsData.reset();
  res.json({ message: 'Data restored to its initial state.' });
});

module.exports = router;
