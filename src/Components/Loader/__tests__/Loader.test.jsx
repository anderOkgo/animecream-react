import { render } from '@testing-library/react';
import Loader from '../Loader';

describe('Loader', () => {
  it('renders the spinner markup', () => {
    const { container } = render(<Loader />);
    expect(container.querySelector('.lds-ring')).toBeInTheDocument();
    expect(container.querySelectorAll('.lds-ring > div')).toHaveLength(4);
  });
});
