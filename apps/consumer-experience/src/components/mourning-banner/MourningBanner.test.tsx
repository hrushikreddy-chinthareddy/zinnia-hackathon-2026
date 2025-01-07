import { render, screen } from '@testing-library/react';
import MockDate from 'mockdate';

import { MourningBanner } from './MourningBanner';

describe('MourningBanner component', () => {
  it('renders the banner when the date is between 2025-01-08 and 2025-01-10', () => {
    MockDate.set('2025-01-08');
    render(<MourningBanner />);
    expect(
      screen.getByText(/In recognition of the National Day of Mourning/)
    ).toBeInTheDocument();
  });

  it('does not render the banner when the date is not between 2025-01-08 and 2025-01-10', () => {
    MockDate.set('2025-01-01');
    render(<MourningBanner />);
    expect(
      screen.queryByText(/In recognition of the National Day of Mourning/)
    ).not.toBeInTheDocument();
  });
});
