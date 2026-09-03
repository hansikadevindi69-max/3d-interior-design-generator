import { useState } from 'react';

/**
 * Form allowing the user to name a project, upload a floor plan image or
 * video, and enter a free-form design prompt describing the desired style,
 * colors and materials.
 */
export default function DesignRequestForm({ onSubmit, isSubmitting }) {
  const [projectName, setProjectName] = useState('My Interior Project');
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!file) {
      setError('Please select a floor plan image or video.');
      return;
    }
    if (!prompt.trim()) {
      setError('Please describe the design you want (colors, style, materials).');
      return;
    }

    onSubmit({ projectName: projectName.trim() || 'Untitled Project', file, prompt: prompt.trim() });
  };

  return (
    <form className="design-form" onSubmit={handleSubmit}>
      <label htmlFor="project-name">Project name</label>
      <input
        id="project-name"
        type="text"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
      />

      <label htmlFor="floorplan-file">Floor plan image or video</label>
      <input
        id="floorplan-file"
        type="file"
        accept="image/*,video/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <label htmlFor="design-prompt">Design prompt</label>
      <textarea
        id="design-prompt"
        placeholder="e.g. modern minimalist living room with navy blue and gold accents, warm wood tones"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
      />

      {error && <p className="design-form__error" role="alert">{error}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Generating design…' : 'Generate 3D Design'}
      </button>
    </form>
  );
}
