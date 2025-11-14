import { render, screen, fireEvent } from '@testing-library/react';
import { useParams, usePathname } from 'next/navigation';

import { NotificationAlert } from './NotificationAlert';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  usePathname: jest.fn(),
}));

const refetchMock = jest.fn();

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: jest.fn(() => ({ data: [], refetch: refetchMock })),
  };
});

const getDismissedIdsMock = jest.fn<string[], [string]>();
const setDismissedIdsMock = jest.fn<void, [string, string[]]>();

jest.mock('@/utils/notificationAlertStorage', () => ({
  getNotificationAlertDismissedIds: (key: string) => getDismissedIdsMock(key),
  setNotificationAlertDismissedIds: (key: string, ids: string[]) =>
    setDismissedIdsMock(key, ids),
}));

describe('NotificationAlert', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default: component has valid params and path
    (useParams as jest.Mock).mockReturnValue({
      planCode: 'PLAN',
      policyNumber: 'POLICY',
    });
    (usePathname as jest.Mock).mockReturnValue('/some/path');
  });

  it('does not render when planCode or policyNumber are missing', () => {
    (useParams as jest.Mock).mockReturnValue({
      planCode: undefined,
      policyNumber: undefined,
    });

    const { container } = render(<NotificationAlert />);
    expect(container.firstChild).toBeNull();
  });

  it('shows the banner when there are in-progress notifications and nothing dismissed', () => {
    (getDismissedIdsMock as jest.Mock).mockReturnValue([]);

    const useQuery = require('@tanstack/react-query').useQuery as jest.Mock;
    useQuery.mockReturnValue({ data: ['id-1'], refetch: refetchMock });

    render(<NotificationAlert />);

    expect(
      screen.getByText("We're still processing 1 recent request(s).")
    ).toBeInTheDocument();
  });

  it('hides the banner when dismissed and stores the current notification IDs', () => {
    (getDismissedIdsMock as jest.Mock).mockReturnValue([]);

    const useQuery = require('@tanstack/react-query').useQuery as jest.Mock;
    useQuery.mockReturnValue({ data: ['id-1', 'id-2'], refetch: refetchMock });

    render(<NotificationAlert />);

    const banner = screen.getByText(
      "We're still processing 2 recent request(s)."
    );
    expect(banner).toBeInTheDocument();

    // Assume BannerAlert renders a dismiss control with role="button"
    const dismissButton = screen.getByRole('button');
    fireEvent.click(dismissButton);

    expect(setDismissedIdsMock).toHaveBeenCalledWith(
      'notificationAlertDismissed:PLAN:POLICY',
      ['id-1', 'id-2']
    );
  });

  it('does not show the banner again when the same notification IDs are dismissed', () => {
    // Hydrate with dismissed IDs
    (getDismissedIdsMock as jest.Mock).mockReturnValue(['id-1']);

    const useQuery = require('@tanstack/react-query').useQuery as jest.Mock;
    useQuery.mockReturnValue({ data: ['id-1'], refetch: refetchMock });

    render(<NotificationAlert />);

    const alert = screen.getByTestId('notification-alert');
    expect(alert).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows the banner again when notification IDs change after dismiss', () => {
    // Hydrate with dismissed ID
    (getDismissedIdsMock as jest.Mock).mockReturnValue(['id-1']);

    const useQuery = require('@tanstack/react-query').useQuery as jest.Mock;
    useQuery.mockReturnValue({ data: ['id-1', 'id-2'], refetch: refetchMock });

    render(<NotificationAlert />);

    const alert = screen.getByTestId('notification-alert');
    expect(alert).toHaveAttribute('aria-hidden', 'false');
  });
});
