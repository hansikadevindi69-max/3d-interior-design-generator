const os = require('os');
const path = require('path');
const fs = require('fs');

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'interior-design-test-'));

process.env.DATABASE_PATH = path.join(tmpRoot, 'test.db');
process.env.UPLOAD_DIR = path.join(tmpRoot, 'uploads');
process.env.NODE_ENV = 'test';
process.env.AI_PROVIDER = 'mock';
