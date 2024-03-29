import {
  Label,
  AssistiveText,
  AssistiveTextVariant,
} from '@zinnia/bloom/internal/components';

import { checkIfNull } from '@/utils/data';
import { DEFAULT_ERROR_STRING, toSentenceCase } from '@/utils/strings';

import styles from './BankData.module.css';
import { FieldData } from '../field-data/FieldData';
import { BankDetail } from '../person-data/types';

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
          {/* Formatting uppercase is the best solution based on the return from zahara */}
          {branchName?.toUpperCase()}
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
