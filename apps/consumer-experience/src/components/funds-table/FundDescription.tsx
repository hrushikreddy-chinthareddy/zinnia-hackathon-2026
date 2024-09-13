import { FundAccountTypeEnum } from '@zinnia/api-types/types/funds';

import { Fund } from '@/services/funds';

const fundIdToFundDescription: { [key: string]: string } = {
  ELI001:
    'This is an indexed account with a segment cap. Your account is credited with interest earnings based on how the tracked index (in this case, the S&P 500®) increases between certain points of time (called segments). The cap is a ceiling on what your account can earn during a given segment. For example, if the index increases 10% between the start and end of a segment, and your segment cap is 5%, the account will be credited with 5% interest. Full segment performance details are available in your account statements.',
  ELI002:
    'This is an indexed account with a participation rate. Your account is credited with interest earnings based on how the tracked index (in this case, the S&P 500®) increases between certain points of time (called segments). The participation rate is a ceiling on what your account can earn during a given segment. For example, if the index increases 10% between the start and end of a segment, and your participation rate is 80%, the account will be credited with 8% interest. Full segment performance details are available in your account statements.',
};

const descriptionText = (fundType?: FundAccountTypeEnum) => {
  switch (fundType) {
    case FundAccountTypeEnum.HOLDING:
      return (
        <p>
          The money that will eventually be deposited into your elected account
          first stops here. Your holding account value is still earning an
          interest rate during the time it waits for the next sweep date.
        </p>
      );
    // TODO: this will need to be updated to be more generic. Amelia to add after
    // all content has been reviewed. 08/28/24
    case FundAccountTypeEnum.INDEXED:
      return (
        <div>
          <p className="mb-lg">
            This is an index account with a participation rate. Your account can
            be credited with interest earnings based on how the tracked index
            (in this case, the S&P 500®) increases between certain points of
            time (called segments). The participation rate determines how the
            account may be credited. For example, if the index increases 10%
            between the start and end of a segment, and your participation rate
            is 80%, the account will be credited with 8% interest. Full segment
            performance details are available in your policy statements.
          </p>
          <p>
            Full segment performance details are available in your policy
            statements.
          </p>
        </div>
      );
    case FundAccountTypeEnum.FIXED:
      return (
        <p>
          This account earns a guaranteed interest rate for your contributions.
          The rate is set by the carrier and may be subject to change. Please
          refer to your policy for more information.{' '}
        </p>
      );
    default:
      return '';
  }
};

export const FundDescription = ({ fund }: { fund: Fund }) => {
  if (fund.fundId && fundIdToFundDescription[fund.fundId]) {
    return <p>{fundIdToFundDescription[fund.fundId]}</p>;
  }

  return descriptionText(fund.fundAccountType);
};
