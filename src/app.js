require('express-async-errors');
const express = require('express');
const cors = require('cors');
const { establishRedisConnection } = require('./utils/redis');

establishRedisConnection();
const router = require('./routes');
const errorHandler = require('./middleware/error-handler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);
app.use(errorHandler);

app.all('*', (req, res) => {
  res.status(404).send('You Arrived No Where 😎');
});

module.exports = { app };
