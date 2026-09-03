require('dotenv').config();
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');

const config = {
  port: parseInt(process.env.PORT, 10) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databasePath: process.env.DATABASE_PATH
    ? path.resolve(rootDir, process.env.DATABASE_PATH)
    : path.join(rootDir, 'data', 'app.db'),
  uploadDir: process.env.UPLOAD_DIR
    ? path.resolve(rootDir, process.env.UPLOAD_DIR)
    : path.join(rootDir, 'uploads'),
  maxUploadSizeMb: parseInt(process.env.MAX_UPLOAD_SIZE_MB, 10) || 25,
  aiProvider: process.env.AI_PROVIDER || 'mock',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  stabilityApiKey: process.env.STABILITY_API_KEY || '',
};

module.exports = config;
