module.exports = [
  {
    resource: 'Recipe',
    fields: [
      { name: 'id', type: 'number' },
      { name: 'title', type: 'string' },
      { name: 'cuisine', type: 'string' },
      { name: 'prepTime', type: 'number (minutes)' },
      { name: 'difficulty', type: 'string (enum: easy | medium | hard)' },
      { name: 'servings', type: 'number' },
    ],
  },
  {
    resource: 'Ingredient',
    fields: [
      { name: 'id', type: 'number' },
      { name: 'recipeId', type: 'number (foreign key -> Recipe.id)' },
      { name: 'name', type: 'string' },
      { name: 'quantity', type: 'string' },
      { name: 'optional', type: 'boolean' },
    ],
  },
];
