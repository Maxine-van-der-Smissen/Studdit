const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const userRoutes = require('./scr/controllers/user.routes');
const threadRoutes = require('./scr/controllers/thread.routes');

app.use('/users', userRoutes);
app.use('/threads', threadRoutes);

module.exports = app;