'use strict';

const express = require('express');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.use(errorHandler);

module.exports = app;
