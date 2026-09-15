const express = require('express');
const path = require('path');

const pagesRouter = require('./src/routes/pages.routes');
const recipesRouter = require('./src/routes/api/recipes.routes');
const ingredientsRouter = require('./src/routes/api/ingredients.routes');
const { notFoundHandler, errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', pagesRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/ingredients', ingredientsRouter);

app.use('/api', notFoundHandler);
app.use((req, res) => {
  res.status(404).send('Not found');
});
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`HTTP & REST game running at http://localhost:${PORT}`);
  console.log(`Schema browser at http://localhost:${PORT}/schemas`);
});
