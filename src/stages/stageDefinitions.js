// SERVER-ONLY answer key. Never import this from anything under public/.
// Each stage has two parts:
//   - public fields (title, description, concepts, inputs) — safe to send to the client
//   - `solution` — method/path/query/body/status requirements, used only by the grader

function sameText(a, b) {
  return typeof a === 'string' && a.trim().toLowerCase() === b.toLowerCase();
}

function hasExactKeys(obj, keys) {
  const actual = Object.keys(obj).sort();
  const expected = keys.slice().sort();
  return actual.length === expected.length && actual.every((k, i) => k === expected[i]);
}

const stages = [
  {
    id: 1,
    title: 'Browse the cookbook',
    description: 'A visitor opens the cookbook home page. Fetch the full list of recipes.',
    concepts: ['GET'],
    inputs: [],
    solution: {
      method: 'GET',
      path: '/api/recipes',
      query: {},
      status: 200,
    },
    successMessage: 'Correct! GET on a collection returns all of its items as JSON.',
  },
  {
    id: 2,
    title: 'Open a single recipe',
    description: 'The visitor clicks on "Pad Thai" (id 5). Fetch only that recipe.',
    concepts: ['GET', 'Route parameter'],
    inputs: ['route'],
    solution: {
      method: 'GET',
      path: '/api/recipes/5',
      query: {},
      status: 200,
    },
    successMessage: 'Correct! A route parameter (/recipes/:id) identifies one specific resource.',
  },
  {
    id: 3,
    title: 'Filter by cuisine',
    description: 'The visitor is craving Italian food. Show only recipes whose cuisine is Italian.',
    concepts: ['GET', 'Query parameter'],
    inputs: ['query'],
    solution: {
      method: 'GET',
      path: '/api/recipes',
      query: { cuisine: (v) => sameText(v, 'Italian') },
      status: 200,
    },
    successMessage: 'Correct! Query parameters filter a collection without changing the path.',
  },
  {
    id: 4,
    title: 'Search and sort',
    description:
      'The visitor searches for "soup" and wants the results sorted by prep time, longest first. ' +
      'The API supports the query parameters q (search in title), sort (field name) and order (asc / desc).',
    concepts: ['GET', 'Multiple query parameters'],
    inputs: ['query'],
    solution: {
      method: 'GET',
      path: '/api/recipes',
      query: {
        q: (v) => sameText(v, 'soup'),
        sort: (v) => v === 'prepTime',
        order: (v) => sameText(v, 'desc'),
      },
      status: 200,
    },
    successMessage: 'Correct! Several query parameters can be combined — search, sort and order in one request.',
  },
  {
    id: 5,
    title: "A recipe's ingredients",
    description:
      'The visitor is about to cook Beef Bourguignon (id 3) and needs its shopping list. ' +
      'Fetch the ingredients that belong to this recipe, using the nested resource under the recipe.',
    concepts: ['GET', 'Route parameter', 'Related resources'],
    inputs: ['route'],
    solution: {
      method: 'GET',
      path: '/api/recipes/3/ingredients',
      query: {},
      status: 200,
    },
    successMessage: 'Correct! Nested paths like /recipes/:id/ingredients express the relation between resources.',
  },
  {
    id: 6,
    title: 'What can I skip?',
    description:
      'Out of shrimp and peanuts, the visitor wants to know which ingredients of Pad Thai (id 5) are optional. ' +
      'Query the ingredients collection, filtering by recipeId and by optional=true.',
    concepts: ['GET', 'Multiple query parameters', 'Related resources'],
    inputs: ['query'],
    solution: {
      method: 'GET',
      path: '/api/ingredients',
      query: {
        recipeId: (v) => v === '5',
        optional: (v) => v === 'true',
      },
      status: 200,
    },
    successMessage: 'Correct! Two query filters narrowed the ingredients down to exactly what was needed.',
  },
  {
    id: 7,
    title: 'A broken link',
    description:
      'An old bookmark points to recipe id 999, which does not exist. Send the request and look at how the server responds. ' +
      'This stage is complete when you receive the proper error status.',
    concepts: ['GET', 'Route parameter', 'Error status codes'],
    inputs: ['route'],
    solution: {
      method: 'GET',
      path: '/api/recipes/999',
      query: {},
      status: 404,
    },
    successMessage: 'Correct! 404 Not Found means the path is valid but no resource exists with that id.',
  },
  {
    id: 8,
    title: 'Share a new recipe',
    description:
      'A home cook submits a new recipe: title "Shakshuka", cuisine "Israeli", prepTime 30, difficulty "easy", servings 2. ' +
      'Create it on the server (check the schemas page for field types — numbers must be sent as numbers).',
    concepts: ['POST', 'Request body', '201 Created'],
    inputs: ['body'],
    bodyTemplate: { title: '', cuisine: '', prepTime: 0, difficulty: '', servings: 0 },
    solution: {
      method: 'POST',
      path: '/api/recipes',
      query: {},
      body: (b) =>
        sameText(b.title, 'Shakshuka') &&
        sameText(b.cuisine, 'Israeli') &&
        b.prepTime === 30 &&
        b.difficulty === 'easy' &&
        b.servings === 2,
      status: 201,
    },
    successMessage: 'Correct! POST to a collection creates a new item — the server answered 201 Created with the new id.',
  },
  {
    id: 9,
    title: 'Incomplete submission',
    description:
      'A buggy form sends a new recipe that contains only a title: "Mystery Stew" — no other fields. ' +
      'Send exactly that and observe how the server protects its data.',
    concepts: ['POST', 'Request body', '400 Bad Request'],
    inputs: ['body'],
    solution: {
      method: 'POST',
      path: '/api/recipes',
      query: {},
      body: (b) => hasExactKeys(b, ['title']) && sameText(b.title, 'Mystery Stew'),
      status: 400,
    },
    successMessage: 'Correct! 400 Bad Request tells the client its data was invalid — and nothing was saved.',
  },
  {
    id: 10,
    title: 'Add an ingredient to a recipe',
    description:
      'The Caprese Salad (recipe id 4) is missing something. Add the ingredient "Balsamic glaze", quantity "1 tbsp", ' +
      'marked as optional — attached directly to that recipe.',
    concepts: ['POST', 'Route parameter', 'Request body', 'Related resources'],
    inputs: ['route', 'body'],
    bodyTemplate: { name: '', quantity: '', optional: false },
    solution: {
      method: 'POST',
      path: '/api/recipes/4/ingredients',
      query: {},
      body: (b) => sameText(b.name, 'Balsamic glaze') && sameText(b.quantity, '1 tbsp') && b.optional === true,
      status: 201,
    },
    successMessage: 'Correct! The route parameter chose the parent recipe and the body described the new ingredient.',
  },
  {
    id: 11,
    title: 'Fix one field',
    description:
      'Readers report that Butter Chicken (id 8) actually serves 6 people, not 4. Update only the servings field — ' +
      'send nothing else, leave the rest of the recipe untouched.',
    concepts: ['PATCH', 'Route parameter', 'Request body'],
    inputs: ['route', 'body'],
    solution: {
      method: 'PATCH',
      path: '/api/recipes/8',
      query: {},
      body: (b) => hasExactKeys(b, ['servings']) && b.servings === 6,
      status: 200,
    },
    successMessage: 'Correct! PATCH applies a partial update — only the fields you send are changed.',
  },
  {
    id: 12,
    title: 'Replace an ingredient',
    description:
      'Pad Thai ingredient id 20 (Peanuts) should be replaced entirely: it becomes "Cashews", quantity "60g", optional true. ' +
      'Replace the whole ingredient resource with the new representation.',
    concepts: ['PUT', 'Route parameter', 'Request body'],
    inputs: ['route', 'body'],
    bodyTemplate: { name: '', quantity: '', optional: false },
    solution: {
      method: 'PUT',
      path: '/api/ingredients/20',
      query: {},
      body: (b) => sameText(b.name, 'Cashews') && sameText(b.quantity, '60g') && b.optional === true,
      status: 200,
    },
    successMessage: 'Correct! PUT replaces the full representation of a resource with the one you send.',
  },
  {
    id: 13,
    title: 'Remove a recipe',
    description:
      'The French Onion Soup (id 7) recipe was a duplicate. Delete it from the cookbook. ' +
      'Afterwards, try fetching it again to see that it is really gone.',
    concepts: ['DELETE', 'Route parameter'],
    inputs: ['route'],
    solution: {
      method: 'DELETE',
      path: '/api/recipes/7',
      query: {},
      status: 200,
    },
    successMessage: 'Correct! DELETE removed the recipe (and its ingredients). You have completed the game!',
  },
];

function getStageDefinition(stageId) {
  const id = Number(stageId);
  return stages.find((s) => s.id === id);
}

function getStageCount() {
  return stages.length;
}

// Only the fields that are safe to expose — never the solution.
function getPublicStages() {
  return stages.map(({ id, title, description, concepts, inputs, bodyTemplate }) => ({
    id,
    title,
    description,
    concepts,
    inputs,
    bodyTemplate: bodyTemplate || null,
  }));
}

module.exports = { getStageDefinition, getStageCount, getPublicStages };
