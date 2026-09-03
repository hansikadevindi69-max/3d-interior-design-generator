/**
 * Small summary panel showing what the AI design pipeline inferred from the
 * floor plan analysis and the design prompt.
 */
export default function DesignSummary({ analysis, design }) {
  if (!analysis && !design) return null;

  return (
    <div className="design-summary">
      {analysis && (
        <div>
          <h3>Floor Plan Analysis</h3>
          <p>
            Estimated area: <strong>{analysis.estimatedAreaSqm} m²</strong> · Rooms detected:{' '}
            <strong>{analysis.roomCount}</strong>
          </p>
          <ul>
            {analysis.rooms.map((room) => (
              <li key={room.id}>
                {room.label}: {room.widthMeters}m × {room.depthMeters}m ({room.areaSqm} m²)
              </li>
            ))}
          </ul>
        </div>
      )}

      {design && (
        <div>
          <h3>Generated Design</h3>
          <p>
            Style: <strong>{design.scene.style}</strong> · Provider:{' '}
            <strong>{design.provider}</strong>
          </p>
          <div className="design-summary__palette">
            {design.scene.palette.map((color) => (
              <span key={color} className="swatch" style={{ backgroundColor: color }} title={color} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
