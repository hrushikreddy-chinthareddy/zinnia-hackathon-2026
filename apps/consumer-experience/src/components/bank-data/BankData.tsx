import Bloom from '@zdx/bloom/components';

import styles from './bankData.module.css';
import {
  AssistiveText,
  AssistiveTextVariant,
} from '../assistive-text/AssistiveText';
import { FieldData } from '../field-data/FieldData';

// TODO: are any of these optional?
interface BankDataProps {
  accountNumber: number;
  accountType: string;
  autopayEnabled?: boolean;
  bankName: string;
  nameOnAccount: string;
  // TODO: is this a number or a string?
  routingNumber: number;
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
  // TODO: how to manage null handling? check all data?
  return (
    <div>
      <h2>{title}</h2>
      <div className={styles.bankName}>
        <div className="typographyLabelsLabelLg">{bankName}</div>
        {autopayEnabled && (
          <AssistiveText
            variant={AssistiveTextVariant.Success}
            text="Premium autopay"
          />
        )}
      </div>
      <div className={styles.detailsContainer}>
        <FieldData
          Label={<Bloom.Label text="Account number" labelFor="remove this" />}
        >
          <p className="typographyContentBodySm">{`Ending in ${accountNumber}`}</p>
        </FieldData>
        <FieldData
          Label={<Bloom.Label text="Routing number" labelFor="remove this" />}
        >
          <p className="typographyContentBodySm">{routingNumber}</p>
        </FieldData>
        {/* TODO: probably need to format this? capitalize? */}
        {/* TODO: remove the label!!!!! */}
        <FieldData
          Label={<Bloom.Label text="Account type" labelFor="remove this" />}
        >
          <p className="typographyContentBodySm">{accountType}</p>
        </FieldData>
        <FieldData
          Label={<Bloom.Label text="Name on account" labelFor="remove this" />}
        >
          <p className="typographyContentBodySm">{nameOnAccount}</p>
        </FieldData>
      </div>
    </div>
  );
};
