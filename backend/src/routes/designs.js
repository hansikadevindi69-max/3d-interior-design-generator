const express = require('express');
const projectModel = require('../models/projectModel');
const floorplanModel = require('../models/floorplanModel');
const designModel = require('../models/designModel');
const aiProvider = require('../services/aiProvider');

const router = express.Router();

router.post('/generate', async (req, res) => {
  const { projectId, floorplanId, prompt } = req.body || {};

  if (!projectId) return res.status(400).json({ error: 'A "projectId" is required.' });
  if (!floorplanId) return res.status(400).json({ error: 'A "floorplanId" is required.' });
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'A design "prompt" is required.' });
  }

  const project = projectModel.getProject(projectId);
  if (!project) return res.status(404).json({ error: 'Project not found.' });

  const floorplan = floorplanModel.getFloorplan(floorplanId);
  if (!floorplan || floorplan.project_id !== projectId) {
    return res.status(404).json({ error: 'Floor plan not found for this project.' });
  }

  try {
    const { provider, scene } = await aiProvider.generateDesign({
      analysis: floorplan.analysis,
      prompt: prompt.trim(),
    });

    const design = designModel.createDesign({
      projectId,
      floorplanId,
      prompt: prompt.trim(),
      scene,
      provider,
    });

    return res.status(201).json({ design });
  } catch (err) {
    return res.status(500).json({ error: `Failed to generate design: ${err.message}` });
  }
});

router.get('/:id', (req, res) => {
  const design = designModel.getDesign(req.params.id);
  if (!design) return res.status(404).json({ error: 'Design not found.' });
  return res.json({ design });
});

router.get('/', (req, res) => {
  const { projectId } = req.query;
  if (!projectId) {
    return res.status(400).json({ error: 'A "projectId" query parameter is required.' });
  }
  return res.json({ designs: designModel.listDesignsByProject(projectId) });
});

module.exports = router;
