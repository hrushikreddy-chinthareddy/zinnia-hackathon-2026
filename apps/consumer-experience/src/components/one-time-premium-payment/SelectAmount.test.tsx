import { fireEvent, render, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';

import {
  SelectAmount,
  dateInvalidMessage,
  dateOutOfRangeMessage,
} from './SelectAmount';
import { OttpProvider } from '../providers/one-time-premium-payment/OttpProvider';

// Mock useRouter:
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      prefetch: () => null,
    };
  },
}));

describe('SelectAmount', () => {
  it('should show error message when date field is empty on form submission', async () => {
    const mockMoveToNextStep = jest.fn();
    const mockPlanCode = 'testPlanCode';
    const mockPolicyNumber = 'testPolicyNumber';
    const mockState = {
      effectiveDate: '',
      paymentAmount: 100,
    };

    jest.mock('../providers/one-time-premium-payment/OttpContext', () => ({
      useOttp: () => ({
        state: mockState,
        dispatch: jest.fn(),
      }),
    }));

    const { getByText, getByRole } = render(
      <OttpProvider>
        <SelectAmount
          moveToNextStep={mockMoveToNextStep}
          planCode={mockPlanCode}
          policyNumber={mockPolicyNumber}
        />
      </OttpProvider>
    );

    fireEvent.click(getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(getByText('Please enter a valid date')).toBeInTheDocument();
    });
  });
});
