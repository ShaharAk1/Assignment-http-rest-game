const express = require('express');
const router = express.Router();
const recipesData = require('../../data/recipes');
const ingredientsData = require('../../data/ingredients');
const { stageGrader } = require('../../stages/stageGrader');

router.use(stageGrader);

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const SORTABLE_FIELDS = ['title', 'prepTime', 'servings'];

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isValidDifficulty(value) {
  return DIFFICULTIES.includes(value);
}

function validateRecipeBody(body, { partial = false } = {}) {
  const errors = [];
  const fields = ['title', 'cuisine', 'prepTime', 'difficulty', 'servings'];
  const toCheck = partial ? fields.filter((f) => f in body) : fields;

  if (!partial && Object.keys(body).length === 0) {
    errors.push('Request body is required.');
    return errors;
  }
  if (partial && toCheck.length === 0) {
    errors.push('At least one field is required.');
    return errors;
  }

  for (const field of toCheck) {
    const value = body[field];
    if (field === 'title' || field === 'cuisine') {
      if (!isNonEmptyString(value)) errors.push(`${field} must be a non-empty string.`);
    } else if (field === 'prepTime' || field === 'servings') {
      if (!isPositiveNumber(value)) errors.push(`${field} must be a positive number.`);
    } else if (field === 'difficulty') {
      if (!isValidDifficulty(value)) errors.push('difficulty must be easy, medium, or hard.');
    }
  }

  return errors;
}

// GET /api/recipes
router.get('/', (req, res) => {
  let results = recipesData.findAll().slice();
  const { cuisine, difficulty, maxPrepTime, q, sort, order } = req.query;

  if (cuisine) {
    results = results.filter((r) => r.cuisine.toLowerCase() === String(cuisine).toLowerCase());
  }
  if (difficulty) {
    results = results.filter((r) => r.difficulty.toLowerCase() === String(difficulty).toLowerCase());
  }
  if (maxPrepTime !== undefined) {
    const max = Number(maxPrepTime);
    if (Number.isFinite(max)) {
      results = results.filter((r) => r.prepTime <= max);
    }
  }
  if (q) {
    const needle = String(q).toLowerCase();
    results = results.filter((r) => r.title.toLowerCase().includes(needle));
  }
  if (sort && SORTABLE_FIELDS.includes(sort)) {
    const dir = order === 'desc' ? -1 : 1;
    results.sort((a, b) => {
      if (a[sort] < b[sort]) return -1 * dir;
      if (a[sort] > b[sort]) return 1 * dir;
      return 0;
    });
  }

  res.json({ data: results });
});

// GET /api/recipes/:id/ingredients (must be declared before /:id to be routed distinctly)
router.get('/:id/ingredients', (req, res) => {
  const id = Number(req.params.id);
  const recipe = recipesData.findById(id);
  if (!recipe) {
    return res.status(404).json({ error: `Recipe ${id} not found.` });
  }
  res.json({ data: ingredientsData.findByRecipeId(id) });
});

// POST /api/recipes/:id/ingredients
router.post('/:id/ingredients', (req, res) => {
  const id = Number(req.params.id);
  const recipe = recipesData.findById(id);
  if (!recipe) {
    return res.status(404).json({ error: `Recipe ${id} not found.` });
  }
  const body = req.body || {};
  if (!isNonEmptyString(body.name) || !isNonEmptyString(body.quantity)) {
    return res.status(400).json({ error: 'name and quantity are required.' });
  }
  const ingredient = ingredientsData.create({
    recipeId: id,
    name: body.name,
    quantity: body.quantity,
    optional: body.optional,
  });
  res.status(201).json({ data: ingredient });
});

// GET /api/recipes/:id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const recipe = recipesData.findById(id);
  if (!recipe) {
    return res.status(404).json({ error: `Recipe ${id} not found.` });
  }
  res.json({ data: recipe });
});

// POST /api/recipes
router.post('/', (req, res) => {
  const body = req.body || {};
  const errors = validateRecipeBody(body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Invalid recipe data.', details: errors });
  }
  const recipe = recipesData.create(body);
  res.status(201).json({ data: recipe });
});

// PUT /api/recipes/:id
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const body = req.body || {};
  const errors = validateRecipeBody(body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Invalid recipe data.', details: errors });
  }
  const recipe = recipesData.replace(id, body);
  if (!recipe) {
    return res.status(404).json({ error: `Recipe ${id} not found.` });
  }
  res.json({ data: recipe });
});

// PATCH /api/recipes/:id
router.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const body = req.body || {};
  const errors = validateRecipeBody(body, { partial: true });
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Invalid recipe data.', details: errors });
  }
  const recipe = recipesData.patch(id, body);
  if (!recipe) {
    return res.status(404).json({ error: `Recipe ${id} not found.` });
  }
  res.json({ data: recipe });
});

// DELETE /api/recipes/:id
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const removed = recipesData.remove(id);
  if (!removed) {
    return res.status(404).json({ error: `Recipe ${id} not found.` });
  }
  ingredientsData.removeByRecipeId(id);
  res.status(200).json({ message: `Recipe ${id} deleted.` });
});

module.exports = router;
