const express = require('express');
const router = express.Router();
const ingredientsData = require('../../data/ingredients');
const { stageGrader } = require('../../stages/stageGrader');

router.use(stageGrader);

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// GET /api/ingredients
router.get('/', (req, res) => {
  let results = ingredientsData.findAll().slice();
  const { recipeId, optional } = req.query;

  if (recipeId !== undefined) {
    const rid = Number(recipeId);
    results = results.filter((i) => i.recipeId === rid);
  }
  if (optional !== undefined) {
    const wantOptional = optional === 'true';
    results = results.filter((i) => i.optional === wantOptional);
  }

  res.json({ data: results });
});

// GET /api/ingredients/:id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const ingredient = ingredientsData.findById(id);
  if (!ingredient) {
    return res.status(404).json({ error: `Ingredient ${id} not found.` });
  }
  res.json({ data: ingredient });
});

// PUT /api/ingredients/:id
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const body = req.body || {};
  if (!isNonEmptyString(body.name) || !isNonEmptyString(body.quantity)) {
    return res.status(400).json({ error: 'name and quantity are required.' });
  }
  const ingredient = ingredientsData.replace(id, body);
  if (!ingredient) {
    return res.status(404).json({ error: `Ingredient ${id} not found.` });
  }
  res.json({ data: ingredient });
});

// DELETE /api/ingredients/:id
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const removed = ingredientsData.remove(id);
  if (!removed) {
    return res.status(404).json({ error: `Ingredient ${id} not found.` });
  }
  res.status(200).json({ message: `Ingredient ${id} deleted.` });
});

module.exports = router;
