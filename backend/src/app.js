const express = require('express');
const cors = require('cors');
const config = require('./config');
const projectsRouter = require('./routes/projects');
const floorplansRouter = require('./routes/floorplans');
const designsRouter = require('./routes/designs');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use('/uploads', express.static(config.uploadDir));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', aiProvider: config.aiProvider });
  });

  app.use('/api/projects', projectsRouter);
  app.use('/api/floorplans', floorplansRouter);
  app.use('/api/designs', designsRouter);

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status || 400;
    res.status(status).json({ error: err.message || 'Unexpected error' });
  });

  return app;
}

module.exports = createApp;
