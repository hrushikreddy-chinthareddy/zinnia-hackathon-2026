import { render, screen } from '@testing-library/react';

import { MourningBanner } from './MourningBanner';

jest.mock('dayjs', () => {
  const originalDayjs = jest.requireActual('dayjs');
  return {
    ...originalDayjs,
    now: jest.fn(() => originalDayjs('2025-01-09')),
  };
});

describe('MourningBanner component', () => {
  it('renders the banner when the date is between 2025-01-08 and 2025-01-10', () => {
    render(<MourningBanner />);
    expect(
      screen.getByText(/In recognition of the National Day of Mourning/)
    ).toBeInTheDocument();
  });

  it('does not render the banner when the date is not between 2025-01-08 and 2025-01-10', () => {
    jest.mock('dayjs', () => {
      const originalDayjs = jest.requireActual('dayjs');
      return {
        ...originalDayjs,
        now: jest.fn(() => originalDayjs('2024-01-01')),
      };
    });
    render(<MourningBanner />);
    expect(
      screen.queryByText(/In recognition of the National Day of Mourning/)
    ).not.toBeInTheDocument();
  });
});
