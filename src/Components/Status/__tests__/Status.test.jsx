import { render } from '@testing-library/react';
import Status from '../Status';

describe('Status', () => {
  it('shows the fire icon when init is truthy', () => {
    const { container } = render(<Status init={Date.now()} proc={false} />);
    expect(container.textContent).toContain('🔥');
    expect(container.textContent).not.toContain('❌');
  });

  it('shows the cross icon when init is falsy', () => {
    const { container } = render(<Status init={false} proc={false} />);
    expect(container.textContent).toContain('❌');
  });

  it('additionally shows the stopwatch icon while proc is truthy', () => {
    const { container } = render(<Status init={false} proc={true} />);
    expect(container.textContent).toContain('⏱');
    expect(container.textContent).toContain('❌');
  });

  it('omits the stopwatch icon when proc is falsy', () => {
    const { container } = render(<Status init={true} proc={false} />);
    expect(container.textContent).not.toContain('⏱');
  });
});
