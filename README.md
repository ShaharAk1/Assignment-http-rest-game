# HTTP & REST Learning Game

An interactive web game for learning HTTP and REST. Each of 12 stages presents a scenario (e.g. "show only Italian recipes") and you must construct the real HTTP request — method, path, query/route parameters, or body — and send it to a live Express backend. There's no simulation: every request hits a real server and every correctness check happens **server-side only**.

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

The server listens on port `3000` by default (override with the `PORT` environment variable).

## Features

- A single stage: fetch the full recipe list with a plain GET request
- Score and attempt tracking, with progress persisted in the browser via `localStorage`
- Fully AJAX-driven — no page reloads while playing
- A separate `/schemas` page (server-rendered) documenting each resource's fields and types

> **Note:** the assignment requires a minimum of 8 stages exercising GET/POST/PUT/PATCH/DELETE, route params, query params, request bodies, and error handling. This build intentionally keeps only stage 1 and will not meet that requirement as-is. The full REST API below still supports everything needed to restore the remaining stages.

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

**Note:** `DELETE` requests return `200` with a small JSON confirmation body (instead of `204 No Content`), so the game can display returned data and the stage verdict together for every response.

## Architecture notes

- Stage "answers" (`src/stages/stageDefinitions.js`) live only on the server and are never sent to the client. Every in-game request carries an `X-Stage-Id` header on the *actual* REST call being attempted; middleware (`src/stages/stageGrader.js`) grades the real incoming request (method, path, query, body, status) against that stage's requirements and attaches the verdict to the response. There is no separate "tell the server what you did" endpoint — the server only ever grades what it actually received.
- Data is stored in memory (`src/data/*.js`) and resets whenever the server restarts — by design, since the assignment does not permit a database.

## Authors

- Shahar Akiva (shaharak0606@gmail.com)
- *(partner name here)*
