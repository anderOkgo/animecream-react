import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

const Bomb = ({ shouldThrow }) => {
  if (shouldThrow) throw new Error('boom');
  return <div>ok</div>;
};

describe('ErrorBoundary', () => {
  let errorSpy;
  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('renders children normally when nothing throws', () => {
    render(
      <ErrorBoundary fallback={<div>fallback</div>}>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('renders the fallback once a child throws', () => {
    render(
      <ErrorBoundary fallback={<div>fallback</div>}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('fallback')).toBeInTheDocument();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('renders null when it has no fallback and a child throws', () => {
    const { container } = render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('resets and re-renders children once resetKey changes', () => {
    const { rerender } = render(
      <ErrorBoundary fallback={<div>fallback</div>} resetKey="a">
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('fallback')).toBeInTheDocument();

    rerender(
      <ErrorBoundary fallback={<div>fallback</div>} resetKey="b">
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('stays in the error state when resetKey does not change', () => {
    const { rerender } = render(
      <ErrorBoundary fallback={<div>fallback</div>} resetKey="a">
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('fallback')).toBeInTheDocument();

    rerender(
      <ErrorBoundary fallback={<div>fallback</div>} resetKey="a">
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('fallback')).toBeInTheDocument();
  });
});
