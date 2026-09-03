import { useState } from 'react';
import DesignRequestForm from './components/DesignRequestForm';
import DesignViewer from './components/DesignViewer';
import DesignSummary from './components/DesignSummary';
import { createProject, uploadFloorplan, generateDesign } from './services/apiClient';
import './App.css';

function App() {
  const [floorplan, setFloorplan] = useState(null);
  const [design, setDesign] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async ({ projectName, file, prompt }) => {
    setIsSubmitting(true);
    setError('');
    try {
      const project = await createProject(projectName);
      const uploadedFloorplan = await uploadFloorplan(project.id, file);
      setFloorplan(uploadedFloorplan);

      const generatedDesign = await generateDesign(project.id, uploadedFloorplan.id, prompt);
      setDesign(generatedDesign);
    } catch (err) {
      const message = err?.response?.data?.error || err.message || 'Something went wrong.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1>3D Interior Design Generator</h1>
        <p>Upload a floor plan and describe your dream interior to generate a 3D design.</p>
      </header>

      <main className="app__main">
        <section className="app__form-panel">
          <DesignRequestForm onSubmit={handleGenerate} isSubmitting={isSubmitting} />
          {error && (
            <p className="app__error" role="alert">
              {error}
            </p>
          )}
          <DesignSummary analysis={floorplan?.analysis} design={design} />
        </section>

        <section className="app__viewer-panel">
          <DesignViewer scene={design?.scene} />
        </section>
      </main>
    </div>
  );
}

export default App;
