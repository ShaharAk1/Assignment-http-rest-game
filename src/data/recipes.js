const SEED = [
  { id: 1, title: 'Margherita Pizza', cuisine: 'Italian', prepTime: 25, difficulty: 'easy', servings: 4 },
  { id: 2, title: 'Chicken Tikka Masala', cuisine: 'Indian', prepTime: 45, difficulty: 'medium', servings: 4 },
  { id: 3, title: 'Beef Bourguignon', cuisine: 'French', prepTime: 180, difficulty: 'hard', servings: 6 },
  { id: 4, title: 'Caprese Salad', cuisine: 'Italian', prepTime: 10, difficulty: 'easy', servings: 2 },
  { id: 5, title: 'Pad Thai', cuisine: 'Thai', prepTime: 30, difficulty: 'medium', servings: 3 },
  { id: 6, title: 'Tom Yum Soup', cuisine: 'Thai', prepTime: 35, difficulty: 'medium', servings: 4 },
  { id: 7, title: 'French Onion Soup', cuisine: 'French', prepTime: 60, difficulty: 'medium', servings: 4 },
  { id: 8, title: 'Butter Chicken', cuisine: 'Indian', prepTime: 40, difficulty: 'hard', servings: 4 },
];

const EDITABLE_FIELDS = ['title', 'cuisine', 'prepTime', 'difficulty', 'servings'];

let recipes;
let nextId;

function reset() {
  recipes = SEED.map((r) => ({ ...r }));
  nextId = recipes.length + 1;
}

reset();

function findAll() {
  return recipes;
}

function findById(id) {
  return recipes.find((r) => r.id === id);
}

function create(data) {
  const recipe = {
    id: nextId++,
    title: data.title,
    cuisine: data.cuisine,
    prepTime: data.prepTime,
    difficulty: data.difficulty,
    servings: data.servings,
  };
  recipes.push(recipe);
  return recipe;
}

function replace(id, data) {
  const recipe = findById(id);
  if (!recipe) return null;
  recipe.title = data.title;
  recipe.cuisine = data.cuisine;
  recipe.prepTime = data.prepTime;
  recipe.difficulty = data.difficulty;
  recipe.servings = data.servings;
  return recipe;
}

function patch(id, data) {
  const recipe = findById(id);
  if (!recipe) return null;
  for (const field of EDITABLE_FIELDS) {
    if (field in data) recipe[field] = data[field];
  }
  return recipe;
}

function remove(id) {
  const index = recipes.findIndex((r) => r.id === id);
  if (index === -1) return false;
  recipes.splice(index, 1);
  return true;
}

module.exports = { findAll, findById, create, replace, patch, remove, reset };
