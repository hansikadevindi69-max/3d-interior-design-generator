import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DesignRequestForm from '../components/DesignRequestForm';

describe('DesignRequestForm', () => {
  it('shows a validation error when submitted without a file', () => {
    const onSubmit = vi.fn();
    render(<DesignRequestForm onSubmit={onSubmit} isSubmitting={false} />);

    fireEvent.change(screen.getByLabelText(/design prompt/i), {
      target: { value: 'modern living room' },
    });
    fireEvent.click(screen.getByRole('button', { name: /generate 3d design/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/select a floor plan/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows a validation error when submitted without a prompt', () => {
    const onSubmit = vi.fn();
    render(<DesignRequestForm onSubmit={onSubmit} isSubmitting={false} />);

    const file = new File(['dummy'], 'plan.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText(/floor plan image or video/i), {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole('button', { name: /generate 3d design/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/describe the design/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with project name, file and prompt when valid', () => {
    const onSubmit = vi.fn();
    render(<DesignRequestForm onSubmit={onSubmit} isSubmitting={false} />);

    const file = new File(['dummy'], 'plan.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText(/floor plan image or video/i), {
      target: { files: [file] },
    });
    fireEvent.change(screen.getByLabelText(/design prompt/i), {
      target: { value: 'cozy scandinavian bedroom' },
    });
    fireEvent.click(screen.getByRole('button', { name: /generate 3d design/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const args = onSubmit.mock.calls[0][0];
    expect(args.prompt).toBe('cozy scandinavian bedroom');
    expect(args.file.name).toBe('plan.png');
    expect(args.projectName).toBe('My Interior Project');
  });

  it('disables the submit button while submitting', () => {
    render(<DesignRequestForm onSubmit={() => {}} isSubmitting />);
    expect(screen.getByRole('button', { name: /generating design/i })).toBeDisabled();
  });
});
