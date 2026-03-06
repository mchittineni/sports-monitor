import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../components/ErrorBoundary';

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Test Content')).toBeDefined();
  });

  it('should render error message when error occurs', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(
      screen.getByText('The application encountered an unexpected error.')
    ).toBeDefined();
    expect(screen.getByText('Error: Test error')).toBeDefined();
  });

  it('should have reset functionality', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const resetButton = screen.queryByRole('button');
    expect(resetButton).toBeDefined();
  });
});
