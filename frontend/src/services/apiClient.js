import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export async function createProject(name) {
  const { data } = await api.post('/projects', { name });
  return data.project;
}

export async function uploadFloorplan(projectId, file) {
  const formData = new FormData();
  formData.append('projectId', projectId);
  formData.append('floorplan', file);
  const { data } = await api.post('/floorplans/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.floorplan;
}

export async function generateDesign(projectId, floorplanId, prompt) {
  const { data } = await api.post('/designs/generate', {
    projectId,
    floorplanId,
    prompt,
  });
  return data.design;
}

export async function getDesign(designId) {
  const { data } = await api.get(`/designs/${designId}`);
  return data.design;
}

export default api;
