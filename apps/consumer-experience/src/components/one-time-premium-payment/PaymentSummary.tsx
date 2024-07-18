import {
  Button,
  Icon,
  IconType,
  Label,
  Popover,
} from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';

import styles from './OneTimePremiumPayment.module.css';
import { FieldData } from '../field-data/FieldData';
import { PaymentSummaryStep } from '../payment-summary-step/PaymentSummaryStep';
import { AccountNumber } from '../pii/AccountNumber';
import { AccountType } from '../pii/AccountType';
import { BankName } from '../pii/BankName';
import { CancelDialogLink } from '../transactions/CancelDialogLink';

export const PaymentSummary = ({
  moveToNextStep,
  planCode,
  policyNumber,
}: {
  moveToNextStep?: () => void;
  planCode: string;
  policyNumber: string;
}) => {
  const router = useRouter();

  return (
    <div>
      <div className={styles.paymentSummaryContainer}>
        <div className={styles.paymentSummaryDetails}>
          <FieldData Label={<Label>Payor</Label>}>
            <span className="typography-content-body-sm">Michael Williams</span>
          </FieldData>
          <FieldData Label={<Label>Effective date</Label>}>
            <span className="typography-content-body-sm">
              {new Date().toLocaleDateString()}
            </span>
          </FieldData>
          <FieldData Label={<Label>Payment method</Label>}>
            <div className="typography-content-body-sm">
              <div>
                <BankName bankName="CHARLES SCHWAB BANK" />
              </div>
              <div>
                <AccountType accountType="Checking" />{' '}
                <span className="typography-content-body-sm">ending in</span>{' '}
                <AccountNumber accountNumber="134233" />
              </div>
            </div>
          </FieldData>
        </div>
        <PaymentSummaryStep
          className={styles.paymentSummaryStepContainer}
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
                        Premium payment fees are charged to cover costs related
                        to sales expenses and/or taxes. If your policy requires
                        these fees, they will be shown here.{' '}
                      </p>
                    </Popover>,
                  ]}
                >
                  Fees
                </Label>
              ),
              value: -450,
            },
          ]}
          totalLabel={<Label>Total deposit</Label>}
        />
      </div>
      <div className={styles.buttonGroup}>
        <Button mode="primary" onClick={moveToNextStep}>
          Submit payment
        </Button>
        <CancelDialogLink planCode={planCode} policyNumber={policyNumber} router={router} />
      </div>
    </div>
  );
};
