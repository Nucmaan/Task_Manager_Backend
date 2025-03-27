const express = require('express');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use('/api/notifications', notificationRoutes);


module.exports = app;



