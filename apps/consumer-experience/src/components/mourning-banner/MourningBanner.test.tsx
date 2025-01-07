import { render, screen } from '@testing-library/react';

import { MourningBanner } from './MourningBanner';

jest.mock('dayjs', () =>
  jest.fn((...args) => {
    const dayjsInstance = jest.requireActual('dayjs')(
      args.filter(arg => arg).length > 0 ? args : '2025-01-09'
    );
    dayjsInstance.isBetween = jest.fn(() => true);
    return dayjsInstance;
  })
);

describe('MourningBanner component', () => {
  it('renders the banner when the date is between 2025-01-08 and 2025-01-10', () => {
    render(<MourningBanner />);
    expect(
      screen.getByText(/In recognition of the National Day of Mourning/)
    ).toBeInTheDocument();
  });

  it('does not render the banner when the date is not between 2025-01-08 and 2025-01-10', () => {
    jest.mock('dayjs', () =>
      jest.fn((...args) => {
        const dayjsInstance = jest.requireActual('dayjs')(
          args.filter(arg => arg).length > 0 ? args : '2025-01-01'
        );
        dayjsInstance.isBetween = jest.fn(() => true);
        return dayjsInstance;
      })
    );
    render(<MourningBanner />);
    expect(
      screen.queryByText(/In recognition of the National Day of Mourning/)
    ).not.toBeInTheDocument();
  });
});
