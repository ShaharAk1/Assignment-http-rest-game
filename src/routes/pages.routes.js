const express = require('express');
const router = express.Router();
const { getStageCount } = require('../stages/stageDefinitions');
const resourceSchemas = require('../schemas/resourceSchemas');

router.get('/', (req, res) => {
  res.render('game', { totalStages: getStageCount() });
});

router.get('/schemas', (req, res) => {
  res.render('schemas', { resources: resourceSchemas });
});

module.exports = router;
