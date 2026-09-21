# HTTP & REST Learning Game

An interactive web game for learning HTTP and REST. Each of 13 stages presents a scenario (e.g. "show only Italian recipes") and you must construct the real HTTP request — method, path, query/route parameters, or body — and send it to a live Express backend. There's no simulation: every request hits a real server and every correctness check happens **server-side only**.

Theme: a **Recipes + Ingredients** cookbook (one recipe has many ingredients).

## Tech stack

- **Server**: Node.js + Express, in-memory data (no database)
- **Views**: EJS (server-side rendered)
- **Client**: Vanilla JavaScript + AJAX (`fetch`), no frameworks
- **Styling**: plain CSS, mobile-first and responsive

## Install & run

```bash
npm install
npm start
```

Then open:

- **Game**: http://localhost:3000/
- **Resource schemas**: http://localhost:3000/schemas

Run `npm test` to check that every stage's revealed answer passes the grader.

The server listens on port `3000` by default (override with the `PORT` environment variable).

## Features

- **13 stages**, each practicing a different concept or combination of concepts (see table below)
- A request builder with HTTP method, path, **route parameters** (`:id` placeholders), **query parameters**, a **JSON request body**, and a live request preview
- The real server response is shown: status code, returned JSON, and a success/error verdict
- Per-part feedback (method / path / query / body / status) that tells you *what* is wrong without revealing the answer
- Score (10 points on the first try, 5 afterwards), attempt counter per stage, progress saved in `localStorage`
- A **🧑‍🍳 Stuck?** button that reveals the stage's answer (solving it afterwards earns no points)
- Go back to any stage you've already unlocked, and a "Next stage" button after solving one
- **Reset data** button that restores the server's in-memory data (useful after deleting or editing records)
- Fully AJAX-driven — no page reloads while playing
- A separate `/schemas` page (server-rendered with EJS) documenting each resource's fields and types
- Cozy kitchen look (gingham tablecloth, recipe-card labels, chalkboard console) with a **Lunch / Dinner** theme toggle (remembered in `localStorage`), course-select tiles, "Order up!" banners, sprinkle confetti and a win screen
- Responsive layout for mobile and desktop

## Stages

| # | Scenario | Concepts |
|---|---|---|
| 1 | Browse the cookbook | GET |
| 2 | Open a single recipe | GET, route parameter |
| 3 | Filter by cuisine | GET, query parameter |
| 4 | Search and sort | GET, multiple query parameters |
| 5 | A recipe's ingredients | GET, route parameter, related resources |
| 6 | What can I skip? | GET, multiple query parameters, related resources |
| 7 | A broken link | GET, route parameter, 404 error |
| 8 | Share a new recipe | POST, request body, 201 Created |
| 9 | Incomplete submission | POST, request body, 400 Bad Request |
| 10 | Add an ingredient to a recipe | POST, route parameter, request body |
| 11 | Fix one field | PATCH, route parameter, request body |
| 12 | Replace an ingredient | PUT, route parameter, request body |
| 13 | Remove a recipe | DELETE, route parameter |

## API overview

All API routes are namespaced under `/api`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/recipes` | List recipes; supports `cuisine`, `difficulty`, `maxPrepTime`, `q`, `sort`, `order` query params |
| GET | `/api/recipes/:id` | Get a single recipe |
| POST | `/api/recipes` | Create a recipe |
| PUT | `/api/recipes/:id` | Replace a recipe entirely |
| PATCH | `/api/recipes/:id` | Partially update a recipe |
| DELETE | `/api/recipes/:id` | Delete a recipe (cascades to its ingredients) |
| GET | `/api/recipes/:id/ingredients` | List ingredients for a recipe |
| POST | `/api/recipes/:id/ingredients` | Add an ingredient to a recipe |
| GET | `/api/ingredients` | List ingredients; supports `recipeId`, `optional` query params |
| GET | `/api/ingredients/:id` | Get a single ingredient |
| PUT | `/api/ingredients/:id` | Update an ingredient |
| DELETE | `/api/ingredients/:id` | Delete an ingredient |
| GET | `/api/stages` | Public stage descriptions (no solutions) |
| GET | `/api/stages/:id/answer` | The answer for one stage (used by the "Stuck?" button) |
| POST | `/api/reset` | Restore the in-memory data to its initial state |

Invalid ids (e.g. `/api/recipes/abc`) return `400`, missing resources return `404`, invalid bodies return `400` with details.

**Note:** `DELETE` requests return `200` with a small JSON confirmation body (instead of `204 No Content`), so the game can display returned data and the stage verdict together for every response.

## Architecture notes

- Stage "answers" (the `solution` of each stage in `src/stages/stageDefinitions.js`) live only on the server and are never sent to the client; `GET /api/stages` exposes only titles and descriptions; a stage's readable answer is sent only on request, from `GET /api/stages/:id/answer` when the player clicks "Stuck?". Every in-game request carries an `X-Stage-Id` header on the *actual* REST call being attempted; middleware (`src/stages/stageGrader.js`) is mounted on `/api` and grades the real incoming request (method, path, query, body, status) against that stage's requirements, attaching the verdict (`stage: { correct, message, checks }`) to the response — including 404/400 error responses. There is no separate "tell the server what you did" endpoint — the server only ever grades what it actually received.
- Data is stored in memory (`src/data/*.js`) and resets whenever the server restarts — by design, since the assignment does not permit a database.

## Authors

- Shahar Akiva (shaharak0606@gmail.com)
- David Norman (davnor10@gmail.com)
