import {
  Label,
  AssistiveText,
  AssistiveTextVariant,
} from '@zinnia/bloom/internal/components';

import { DEFAULT_ERROR_STRING, toSentenceCase } from '@/utils/strings';

import styles from './BankData.module.css';
import { FieldData } from '../field-data/FieldData';
import { checkIfNull } from '@/utils/data';

export interface BankDataProps {
  accountNumber: string;
  accountType: string;
  autopayEnabled?: boolean;
  bankName: string;
  nameOnAccount: string;
  routingNumber: string;
}

export const BankData = ({
  accountNumber,
  accountType,
  autopayEnabled,
  bankName,
  nameOnAccount,
  routingNumber,
}: BankDataProps) => {
  return (
    <div>
      <div className={styles.bankName}>
        <div className="typography-labels-label-lg">
          {/* Formatting uppercase is the best solution based on the return from zahara */}
          {bankName?.toUpperCase()}
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
            {accountNumber
              ? `Ending in ${accountNumber}`
              : DEFAULT_ERROR_STRING}
          </p>
        </FieldData>
        <FieldData Label={<Label>Routing number</Label>}>
          <p className="typography-content-body-sm">
            {checkIfNull(routingNumber)}
          </p>
        </FieldData>
        <FieldData Label={<Label>Account type</Label>}>
          <p className="typography-content-body-sm">
            {toSentenceCase(accountType)}
          </p>
        </FieldData>
        <FieldData Label={<Label>Name on account</Label>}>
          <p className="typography-content-body-sm">
            {checkIfNull(nameOnAccount)}
          </p>
        </FieldData>
      </div>
    </div>
  );
};
