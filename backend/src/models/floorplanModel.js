const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');

function createFloorplan({ projectId, fileName, filePath, mediaType, analysis }) {
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    `INSERT INTO floorplans (id, project_id, file_name, file_path, media_type, analysis_json)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, projectId, fileName, filePath, mediaType, JSON.stringify(analysis));
  return getFloorplan(id);
}

function getFloorplan(id) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM floorplans WHERE id = ?').get(id);
  return deserialize(row);
}

function listFloorplansByProject(projectId) {
  const db = getDb();
  const rows = db
    .prepare('SELECT * FROM floorplans WHERE project_id = ? ORDER BY created_at DESC')
    .all(projectId);
  return rows.map(deserialize);
}

function deserialize(row) {
  if (!row) return row;
  return { ...row, analysis: JSON.parse(row.analysis_json) };
}

module.exports = {
  createFloorplan,
  getFloorplan,
  listFloorplansByProject,
};
