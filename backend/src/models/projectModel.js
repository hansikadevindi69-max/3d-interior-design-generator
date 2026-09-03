const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');

function createProject({ name }) {
  const db = getDb();
  const id = uuidv4();
  db.prepare('INSERT INTO projects (id, name) VALUES (?, ?)').run(id, name);
  return getProject(id);
}

function listProjects() {
  const db = getDb();
  return db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
}

function getProject(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
}

function deleteProject(id) {
  const db = getDb();
  const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  return result.changes > 0;
}

module.exports = {
  createProject,
  listProjects,
  getProject,
  deleteProject,
};
