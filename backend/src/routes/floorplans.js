const express = require('express');
const path = require('path');
const upload = require('../middleware/upload');
const { analyzeFloorPlan } = require('../services/floorPlanAnalyzer');
const projectModel = require('../models/projectModel');
const floorplanModel = require('../models/floorplanModel');

const router = express.Router();

router.post('/upload', upload.single('floorplan'), (req, res) => {
  const { projectId } = req.body || {};
  if (!req.file) {
    return res.status(400).json({ error: 'A "floorplan" file is required.' });
  }
  if (!projectId) {
    return res.status(400).json({ error: 'A "projectId" is required.' });
  }

  const project = projectModel.getProject(projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  try {
    const analysis = analyzeFloorPlan(req.file.path, req.file.originalname);
    const floorplan = floorplanModel.createFloorplan({
      projectId,
      fileName: req.file.originalname,
      filePath: path.basename(req.file.path),
      mediaType: analysis.mediaType,
      analysis,
    });
    return res.status(201).json({ floorplan });
  } catch (err) {
    return res.status(422).json({ error: `Failed to analyze floor plan: ${err.message}` });
  }
});

router.get('/:id', (req, res) => {
  const floorplan = floorplanModel.getFloorplan(req.params.id);
  if (!floorplan) return res.status(404).json({ error: 'Floor plan not found.' });
  return res.json({ floorplan });
});

router.get('/', (req, res) => {
  const { projectId } = req.query;
  if (!projectId) {
    return res.status(400).json({ error: 'A "projectId" query parameter is required.' });
  }
  return res.json({ floorplans: floorplanModel.listFloorplansByProject(projectId) });
});

module.exports = router;
