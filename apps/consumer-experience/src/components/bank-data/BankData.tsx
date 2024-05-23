import {
  Label,
  AssistiveText,
  AssistiveTextVariant,
} from '@zinnia/bloom/internal/components';

import { FieldData } from '@/components/field-data/FieldData';
import { BankDetail } from '@/components/person-data/types';
import { AccountNumber } from '@/components/pii/AccountNumber';
import { AccountType } from '@/components/pii/AccountType';
import { BankName } from '@/components/pii/BankName';
import { Name } from '@/components/pii/Name';
import { RoutingNumber } from '@/components/pii/RoutingNumber';

import styles from './BankData.module.css';

export const BankData = ({
  accountNumber,
  accountType,
  autopayEnabled,
  branchName,
  nameOnAccount,
  routingNumber,
}: BankDetail) => {
  return (
    <div>
      <div className={styles.bankName}>
        <div className="typography-labels-label-lg">
          <BankName bankName={branchName} />
        </div>
        {autopayEnabled && (
          <AssistiveText
            variant={AssistiveTextVariant.Success}
            text="Premium autopay"
          />
        )}
      </div>
      <div className={styles.detailsContainer}>
        <FieldData Label={<Label>Account number</Label>}>
          <p className="typography-content-body-sm">
            {!!accountNumber && 'Ending in '}
            <AccountNumber accountNumber={accountNumber} />
          </p>
        </FieldData>
        <FieldData Label={<Label>Routing number</Label>}>
          <p className="typography-content-body-sm">
            <RoutingNumber routingNumber={routingNumber} />
          </p>
        </FieldData>
        <FieldData Label={<Label>Account type</Label>}>
          <p className="typography-content-body-sm">
            <AccountType accountType={accountType} />
          </p>
        </FieldData>
        <FieldData Label={<Label>Name on account</Label>}>
          <p className="typography-content-body-sm">
            <Name displayName={nameOnAccount} />
          </p>
        </FieldData>
      </div>
    </div>
  );
};
