import { render, screen } from '@testing-library/react';

import { MourningBanner } from './MourningBanner';

describe('MourningBanner component', () => {
  beforeEach(() => {
    jest.useFakeTimers(); // Enable modern fake timers
  });

  afterEach(() => {
    jest.useRealTimers(); // Restore real timers after each test
  });

  it('renders the banner when the date is between 2025-01-08 and 2025-01-10', () => {
    jest.setSystemTime(new Date('2025-01-08T00:00:00'));
    render(<MourningBanner />);
    expect(
      screen.getByText(/In recognition of the National Day of Mourning/)
    ).toBeInTheDocument();
  });

  it('does not render the banner when the date is not between 2025-01-08 and 2025-01-10', () => {
    jest.setSystemTime(new Date('2025-01-01T00:00:00'));
    render(<MourningBanner />);
    expect(
      screen.queryByText(/In recognition of the National Day of Mourning/)
    ).not.toBeInTheDocument();
  });
});
