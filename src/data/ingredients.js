let ingredients = [
  // Margherita Pizza (1)
  { id: 1, recipeId: 1, name: 'Pizza dough', quantity: '1 ball', optional: false },
  { id: 2, recipeId: 1, name: 'Tomato sauce', quantity: '100ml', optional: false },
  { id: 3, recipeId: 1, name: 'Mozzarella', quantity: '150g', optional: false },
  { id: 4, recipeId: 1, name: 'Fresh basil', quantity: '5 leaves', optional: true },

  // Chicken Tikka Masala (2)
  { id: 5, recipeId: 2, name: 'Chicken breast', quantity: '500g', optional: false },
  { id: 6, recipeId: 2, name: 'Yogurt', quantity: '200g', optional: false },
  { id: 7, recipeId: 2, name: 'Tikka masala paste', quantity: '2 tbsp', optional: false },
  { id: 8, recipeId: 2, name: 'Cream', quantity: '100ml', optional: true },

  // Beef Bourguignon (3)
  { id: 9, recipeId: 3, name: 'Beef chuck', quantity: '1kg', optional: false },
  { id: 10, recipeId: 3, name: 'Red wine', quantity: '750ml', optional: false },
  { id: 11, recipeId: 3, name: 'Carrots', quantity: '3', optional: false },
  { id: 12, recipeId: 3, name: 'Pearl onions', quantity: '200g', optional: true },
  { id: 13, recipeId: 3, name: 'Bacon lardons', quantity: '150g', optional: false },

  // Caprese Salad (4)
  { id: 14, recipeId: 4, name: 'Tomatoes', quantity: '4', optional: false },
  { id: 15, recipeId: 4, name: 'Mozzarella', quantity: '200g', optional: false },
  { id: 16, recipeId: 4, name: 'Fresh basil', quantity: '10 leaves', optional: false },

  // Pad Thai (5)
  { id: 17, recipeId: 5, name: 'Rice noodles', quantity: '200g', optional: false },
  { id: 18, recipeId: 5, name: 'Shrimp', quantity: '200g', optional: true },
  { id: 19, recipeId: 5, name: 'Bean sprouts', quantity: '100g', optional: false },
  { id: 20, recipeId: 5, name: 'Peanuts', quantity: '50g', optional: true },

  // Tom Yum Soup (6)
  { id: 21, recipeId: 6, name: 'Shrimp stock', quantity: '1L', optional: false },
  { id: 22, recipeId: 6, name: 'Lemongrass', quantity: '2 stalks', optional: false },
  { id: 23, recipeId: 6, name: 'Lime leaves', quantity: '4', optional: false },
  { id: 24, recipeId: 6, name: 'Chili paste', quantity: '2 tbsp', optional: false },

  // French Onion Soup (7)
  { id: 25, recipeId: 7, name: 'Onions', quantity: '6 large', optional: false },
  { id: 26, recipeId: 7, name: 'Beef stock', quantity: '1L', optional: false },
  { id: 27, recipeId: 7, name: 'Gruyere cheese', quantity: '150g', optional: false },
  { id: 28, recipeId: 7, name: 'Baguette', quantity: '4 slices', optional: false },

  // Butter Chicken (8)
  { id: 29, recipeId: 8, name: 'Chicken thighs', quantity: '600g', optional: false },
  { id: 30, recipeId: 8, name: 'Butter', quantity: '80g', optional: false },
  { id: 31, recipeId: 8, name: 'Tomato puree', quantity: '300ml', optional: false },
  { id: 32, recipeId: 8, name: 'Garam masala', quantity: '1 tbsp', optional: true },
];

let nextId = ingredients.length + 1;

function findAll() {
  return ingredients;
}

function findById(id) {
  return ingredients.find((i) => i.id === id);
}

function findByRecipeId(recipeId) {
  return ingredients.filter((i) => i.recipeId === recipeId);
}

function create(data) {
  const ingredient = {
    id: nextId++,
    recipeId: data.recipeId,
    name: data.name,
    quantity: data.quantity,
    optional: !!data.optional,
  };
  ingredients.push(ingredient);
  return ingredient;
}

function replace(id, data) {
  const ingredient = findById(id);
  if (!ingredient) return null;
  ingredient.name = data.name;
  ingredient.quantity = data.quantity;
  ingredient.optional = !!data.optional;
  return ingredient;
}

function remove(id) {
  const index = ingredients.findIndex((i) => i.id === id);
  if (index === -1) return false;
  ingredients.splice(index, 1);
  return true;
}

function removeByRecipeId(recipeId) {
  ingredients = ingredients.filter((i) => i.recipeId !== recipeId);
}

module.exports = { findAll, findById, findByRecipeId, create, replace, remove, removeByRecipeId };
