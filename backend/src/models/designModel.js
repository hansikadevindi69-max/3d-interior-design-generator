const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');

function createDesign({ projectId, floorplanId, prompt, scene, provider }) {
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    `INSERT INTO designs (id, project_id, floorplan_id, prompt, scene_json, provider)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, projectId, floorplanId || null, prompt, JSON.stringify(scene), provider);
  return getDesign(id);
}

function getDesign(id) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM designs WHERE id = ?').get(id);
  return deserialize(row);
}

function listDesignsByProject(projectId) {
  const db = getDb();
  const rows = db
    .prepare('SELECT * FROM designs WHERE project_id = ? ORDER BY created_at DESC')
    .all(projectId);
  return rows.map(deserialize);
}

function deserialize(row) {
  if (!row) return row;
  return { ...row, scene: JSON.parse(row.scene_json) };
}

module.exports = {
  createDesign,
  getDesign,
  listDesignsByProject,
};
