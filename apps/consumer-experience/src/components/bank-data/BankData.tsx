import {
  Label,
  AssistiveText,
  AssistiveTextVariant,
} from '@zinnia/bloom/internal/components';

import { toTitleCase } from '@/utils/strings';

import styles from './BankData.module.css';
import { FieldData } from '../field-data/FieldData';

export interface BankDataProps {
  accountNumber: number;
  accountType: string;
  autopayEnabled?: boolean;
  bankName: string;
  nameOnAccount: string;
  routingNumber: string;
  title: string;
}

export const BankData = ({
  accountNumber,
  accountType,
  autopayEnabled,
  bankName,
  nameOnAccount,
  routingNumber,
  title,
}: BankDataProps) => {
  return (
    <div>
      <h2>{title}</h2>
      <div className={styles.bankName}>
        {/* TODO: Format the bank name, how to do this? */}
        <div className="typography-labels-label-lg">{bankName}</div>
        {autopayEnabled && (
          <AssistiveText
            variant={AssistiveTextVariant.Success}
            text="Premium autopay"
          />
        )}
      </div>
      <div className={styles.detailsContainer}>
        <FieldData Label={<Label>Account number</Label>}>
          <p className="typography-content-body-sm">{`Ending in ${accountNumber}`}</p>
        </FieldData>
        <FieldData Label={<Label>Routing number</Label>}>
          <p className="typography-content-body-sm">{routingNumber}</p>
        </FieldData>
        <FieldData Label={<Label>Account type</Label>}>
          <p className="typography-content-body-sm">
            {toTitleCase(accountType)}
          </p>
        </FieldData>
        <FieldData Label={<Label>Name on account</Label>}>
          <p className="typography-content-body-sm">{nameOnAccount}</p>
        </FieldData>
      </div>
    </div>
  );
};
