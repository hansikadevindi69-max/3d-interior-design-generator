const express = require('express');
const projectModel = require('../models/projectModel');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ projects: projectModel.listProjects() });
});

router.post('/', (req, res) => {
  const { name } = req.body || {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'A project "name" is required.' });
  }
  const project = projectModel.createProject({ name: name.trim() });
  return res.status(201).json({ project });
});

router.get('/:id', (req, res) => {
  const project = projectModel.getProject(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found.' });
  return res.json({ project });
});

router.delete('/:id', (req, res) => {
  const deleted = projectModel.deleteProject(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Project not found.' });
  return res.status(204).send();
});

module.exports = router;
