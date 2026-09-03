const createApp = require('./app');
const config = require('./config');

const app = createApp();

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`3D Interior Design Generator API listening on port ${config.port}`);
});
