const dotenv = require('dotenv');

dotenv.config();

try {
  const { validateConfig } = require('./config');
  validateConfig();

  const { createApp } = require('./app');
  const { initializeDatabase } = require('./db');
  const port = Number(process.env.PORT) || 5001;

  initializeDatabase()
    .then(() => {
      createApp().listen(port, () => console.log(`MyChart API listening on port ${port}`));
    })
    .catch((error) => {
      console.error('Unable to initialize PostgreSQL:', error.message);
      process.exitCode = 1;
    });
} catch (error) {
  console.error(`Unable to start MyChart API: ${error.message}`);
  process.exitCode = 1;
}
