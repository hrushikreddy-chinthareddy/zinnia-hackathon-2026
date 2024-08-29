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
          The money that will eventually be deposited into your elected funds
          first stops here. Your holding fund value is still earning an interest
          rate during the time it waits for the next sweep date.
        </p>
      );
    // TODO: this will need to be updated to be more generic. Amelia to add after
    // all content has been reviewed. 08/28/24
    case FundAccountTypeEnum.INDEXED:
      return (
        <div>
          <p className="mb-lg">
            This is an indexed account with a segment cap. Your account is
            credited with interest earnings based on how the tracked index (in
            this case, the S&P 500®) increases between certain points of time
            (called segments). The segment cap is a ceiling on what your account
            can earn . For example, if the index increases 10% between the start
            and end of a segment, and your segment cap is 5%, the account will
            be credited with 5% interest.
          </p>
          <p>
            Segment performance details are available in your account
            statements.
          </p>
        </div>
      );
    case FundAccountTypeEnum.FIXED:
      return (
        <p>
          This fund earns a guaranteed interest rate for your contributions.{' '}
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
