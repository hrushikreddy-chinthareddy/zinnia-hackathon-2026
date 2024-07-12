import { Icon, IconType, Label, Popover } from '@zinnia/bloom/components';
import { PaymentSummaryStep } from '../payment-summary-step/PaymentSummaryStep';
import { FieldData } from '../field-data/FieldData';
import { BankName } from '../pii/BankName';
import { AccountNumber } from '../pii/AccountNumber';

export const PaymentSummary = () => {
  return (
    <div>
      <div>
        <FieldData Label={<Label>Payor</Label>}>Michael Williams</FieldData>
        <FieldData Label={<Label>Effective date</Label>}>
          {new Date().toLocaleDateString()}
        </FieldData>
        <FieldData Label={<Label>Payment method</Label>}>
          <>
            <div>
              <BankName bankName="CHARLES SCHWAB BANK" />
            </div>
            <div>
              <AccountNumber accountNumber="134233" />
            </div>
          </>
        </FieldData>
      </div>
      <PaymentSummaryStep
        transactionSummary={[
          {
            label: <Label>Submitted Amount</Label>,
            value: 10000,
          },
          {
            label: (
              <Label
                interactiveElements={[
                  <Popover
                    key="TEXT"
                    title="Fees"
                    trigger={
                      <Icon
                        type={IconType.CIRCLE_INFO}
                        color="var(--color-base-icon-icon-tooltip, #ff7500)"
                        width={16}
                        height={16}
                      />
                    }
                  >
                    <p>
                      Premium payment fees are charged to cover costs related to
                      sales expenses and/or taxes. If your policy requires these
                      fees, they will be shown here.{' '}
                    </p>
                  </Popover>,
                ]}
              >
                Fees
              </Label>
            ),
            value: 450,
          },
        ]}
        totalLabel={<Label>Total deposit</Label>}
      />
    </div>
  );
};
