import { render } from '@testing-library/react';
import { FundAccountTypeEnum } from '@zinnia/api-types/types/funds';

import { FundDetailsSidesheetInner } from './FundDetailsSidesheetInner';

describe('FundDetailsSidesheetInner', () => {
  // Renders fund details correctly when valid fundDetails are provided
  // HOLDING
  it('should render fund details correctly when valid fundDetails are provided', () => {
    const fundDetails = {
      fundId: '1',
      fundName: 'Test Fund',
      totalFundValue: 1000,
      fundAccountType: FundAccountTypeEnum.HOLDING,
      allocationPercentage: 50,
      interestRate: 5,
      sweepDate: '2023-12-31',
    };

    const { getByText } = render(
      <FundDetailsSidesheetInner fundDetails={fundDetails} />
    );

    expect(getByText('Interest rate')).toBeInTheDocument();
    expect(getByText('Fund value')).toBeInTheDocument();
    expect(getByText('Next sweep date')).toBeInTheDocument();
  });

  // FIXED
  it('should render fund details correctly when valid fundDetails are provided', () => {
    const fundDetails = {
      fundId: '1',
      fundName: 'Test Fund',
      totalFundValue: 1000,
      fundAccountType: FundAccountTypeEnum.FIXED,
      allocationPercentage: 50,
      interestRate: 5,
      sweepDate: '2023-12-31',
    };

    const { getByText } = render(
      <FundDetailsSidesheetInner fundDetails={fundDetails} />
    );

    expect(getByText('Fund type')).toBeInTheDocument();
    expect(getByText('Fund value')).toBeInTheDocument();
    expect(getByText('Allocation')).toBeInTheDocument();
    expect(getByText('Interest rate')).toBeInTheDocument();
  });

  // Indexed
  it('should render fund details correctly when valid fundDetails are provided', () => {
    const fundDetails = {
      fundId: '1',
      fundName: 'Test Fund',
      totalFundValue: 1000,
      fundAccountType: FundAccountTypeEnum.INDEXED,
      allocationPercentage: 50,
      interestRate: 5,
      sweepDate: '2023-12-31',
    };

    const { getByText } = render(
      <FundDetailsSidesheetInner fundDetails={fundDetails} />
    );

    expect(getByText('Fund type')).toBeInTheDocument();
    expect(getByText('Fund value')).toBeInTheDocument();
    expect(getByText('Allocation')).toBeInTheDocument();
  });

  // Returns null when fundDetails is null or undefined
  it('should return null when fundDetails is null or undefined', () => {
    const { container: containerUndefined } = render(
      <FundDetailsSidesheetInner fundDetails={undefined} />
    );
    expect(containerUndefined.firstChild).toBeNull();
  });
});
