# API Reference

Base URL (local development): `http://localhost:4000/api`

All endpoints accept and return JSON, except the floor plan upload endpoint
which accepts `multipart/form-data`.

## Health

### `GET /api/health`
Returns API status and the currently configured AI provider.

```json
{ "status": "ok", "aiProvider": "mock" }
```

## Projects

### `POST /api/projects`
Create a new project.

Request body:
```json
{ "name": "Cozy Apartment" }
```

Response `201`:
```json
{ "project": { "id": "uuid", "name": "Cozy Apartment", "created_at": "...", "updated_at": "..." } }
```

### `GET /api/projects`
List all projects.

### `GET /api/projects/:id`
Get a single project.

### `DELETE /api/projects/:id`
Delete a project (cascades to its floor plans and designs).

## Floor Plans

### `POST /api/floorplans/upload`
Upload a floor plan image or video and analyze it. Multipart fields:

| Field        | Type   | Description                              |
|--------------|--------|-------------------------------------------|
| `projectId`  | text   | ID of an existing project                 |
| `floorplan`  | file   | Image (png/jpg/webp/gif/bmp) or video (mp4/mov/avi/webm/mkv) |

Response `201`:
```json
{
  "floorplan": {
    "id": "uuid",
    "project_id": "uuid",
    "file_name": "plan.png",
    "media_type": "image",
    "analysis": {
      "estimatedAreaSqm": 64,
      "roomCount": 3,
      "rooms": [
        { "id": "room-1", "type": "living_room", "label": "Living Room",
          "widthMeters": 5.2, "depthMeters": 4.1, "heightMeters": 2.7,
          "areaSqm": 21.3, "position": { "x": 0, "y": 0, "z": 0 } }
      ],
      "constraints": { "totalFootprintWidthMeters": 15.9, "maxRoomDepthMeters": 4.1, "ceilingHeightMeters": 2.7 }
    }
  }
}
```

### `GET /api/floorplans/:id`
Get a floor plan and its analysis.

### `GET /api/floorplans?projectId=:id`
List floor plans for a project.

## Designs

### `POST /api/designs/generate`
Generate a 3D interior design scene from a floor plan analysis and a design
prompt.

Request body:
```json
{
  "projectId": "uuid",
  "floorplanId": "uuid",
  "prompt": "modern minimalist living room with navy blue and gold accents"
}
```

Response `201`:
```json
{
  "design": {
    "id": "uuid",
    "prompt": "modern minimalist living room with navy blue and gold accents",
    "provider": "mock",
    "scene": {
      "style": "modern",
      "palette": ["#233c58", "#c9a24b"],
      "materials": ["wood", "linen"],
      "rooms": [
        {
          "id": "room-1",
          "wallColor": "#233c58",
          "floorColor": "#c9a24b",
          "furniture": [ { "type": "sofa", "color": "#233c58", "material": "wood", "position": { "x": 1.2, "y": 0, "z": 0.6 } } ],
          "lighting": [ { "type": "ambient", "intensity": 0.5, "color": "#ffffff" } ],
          "decor": [ { "type": "plant", "color": "#4c7a4c", "position": { "x": 0.3, "y": 0, "z": 2.4 } } ]
        }
      ]
    }
  }
}
```

The `scene` object is a provider-agnostic description that the frontend
renders in real time using Three.js (see `frontend/src/three/sceneBuilder.js`)
and can export as a PNG snapshot or a glTF 3D model.

### `GET /api/designs/:id`
Get a generated design.

### `GET /api/designs?projectId=:id`
List designs for a project.

## AI Providers

The `AI_PROVIDER` environment variable selects the design-generation
backend:

- `mock` (default): fully offline, deterministic keyword-based design
  generation - no external API calls or credentials required.
- `openai` / `stability`: reserved for future integration with external
  image-generation APIs once `OPENAI_API_KEY` / `STABILITY_API_KEY` are
  configured. Furniture/lighting layout planning currently uses the same
  deterministic engine regardless of provider.
