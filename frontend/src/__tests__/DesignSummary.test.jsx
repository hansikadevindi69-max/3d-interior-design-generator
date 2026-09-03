import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DesignSummary from '../components/DesignSummary';

describe('DesignSummary', () => {
  it('renders nothing when there is no data', () => {
    const { container } = render(<DesignSummary analysis={null} design={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders floor plan analysis details', () => {
    render(
      <DesignSummary
        analysis={{
          estimatedAreaSqm: 60,
          roomCount: 2,
          rooms: [
            { id: 'room-1', label: 'Living Room', widthMeters: 4, depthMeters: 3, areaSqm: 12 },
            { id: 'room-2', label: 'Bedroom', widthMeters: 3, depthMeters: 3, areaSqm: 9 },
          ],
        }}
        design={null}
      />
    );

    expect(screen.getByText(/60 m²/)).toBeInTheDocument();
    expect(screen.getByText(/Living Room/)).toBeInTheDocument();
  });

  it('renders generated design details with a palette', () => {
    render(
      <DesignSummary
        analysis={null}
        design={{
          provider: 'mock',
          scene: { style: 'modern', palette: ['#ffffff', '#4a6b8a'] },
        }}
      />
    );

    expect(screen.getByText('modern')).toBeInTheDocument();
    expect(screen.getByText('mock')).toBeInTheDocument();
  });
});
