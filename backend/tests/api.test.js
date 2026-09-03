const path = require('path');
const request = require('supertest');
const createApp = require('../src/app');
const { resetDb } = require('../src/db');

describe('API integration', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  afterAll(() => {
    resetDb();
  });

  const fixture = path.join(__dirname, 'fixtures', 'sample-floorplan.png');

  it('reports healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('rejects project creation without a name', async () => {
    const res = await request(app).post('/api/projects').send({});
    expect(res.status).toBe(400);
  });

  it('supports the full project -> floorplan -> design workflow', async () => {
    const projectRes = await request(app)
      .post('/api/projects')
      .send({ name: 'Cozy Apartment' });
    expect(projectRes.status).toBe(201);
    const projectId = projectRes.body.project.id;

    const uploadRes = await request(app)
      .post('/api/floorplans/upload')
      .field('projectId', projectId)
      .attach('floorplan', fixture);
    expect(uploadRes.status).toBe(201);
    expect(uploadRes.body.floorplan.analysis.roomCount).toBeGreaterThan(0);
    const floorplanId = uploadRes.body.floorplan.id;

    const designRes = await request(app)
      .post('/api/designs/generate')
      .send({
        projectId,
        floorplanId,
        prompt: 'modern minimalist living room with warm wood tones and soft lighting',
      });
    expect(designRes.status).toBe(201);
    expect(designRes.body.design.scene.rooms.length).toBeGreaterThan(0);
    expect(designRes.body.design.provider).toBe('mock');

    const getDesignRes = await request(app).get(`/api/designs/${designRes.body.design.id}`);
    expect(getDesignRes.status).toBe(200);
    expect(getDesignRes.body.design.prompt).toContain('minimalist');

    const listRes = await request(app).get(`/api/designs?projectId=${projectId}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.designs.length).toBe(1);
  });

  it('returns 404 for a design generation request with an unknown floorplan', async () => {
    const projectRes = await request(app).post('/api/projects').send({ name: 'Test Project' });
    const projectId = projectRes.body.project.id;

    const res = await request(app)
      .post('/api/designs/generate')
      .send({ projectId, floorplanId: 'does-not-exist', prompt: 'cozy bedroom' });
    expect(res.status).toBe(404);
  });

  it('rejects floor plan uploads without a file', async () => {
    const projectRes = await request(app).post('/api/projects').send({ name: 'No File' });
    const projectId = projectRes.body.project.id;

    const res = await request(app)
      .post('/api/floorplans/upload')
      .field('projectId', projectId);
    expect(res.status).toBe(400);
  });
});
