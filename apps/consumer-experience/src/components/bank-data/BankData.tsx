import { Label } from '@zdx/bloom/components';

import styles from './BankData.module.css';
import { AssistiveText, AssistiveTextVariant } from '@zdx/bloom/components';
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
        <div className="typography-labels-label-lg">{bankName}</div>
        {autopayEnabled && (
          <AssistiveText
            variant={AssistiveTextVariant.Success}
            text="Premium autopay"
          />
        )}
      </div>
      <div className={styles.detailsContainer}>
        <FieldData Label={<Label labelFor="remove this">Account number</Label>}>
          <p className="typography-content-body-sm">{`Ending in ${accountNumber}`}</p>
        </FieldData>
        <FieldData Label={<Label labelFor="remove this">Routing number</Label>}>
          <p className="typography-content-body-sm">{routingNumber}</p>
        </FieldData>
        {/* TODO: probably need to format this? capitalize? */}
        {/* TODO: remove the label!!!!! */}
        <FieldData Label={<Label labelFor="remove this">Account type</Label>}>
          <p className="typography-content-body-sm">{accountType}</p>
        </FieldData>
        <FieldData
          Label={<Label labelFor="remove this">Name on account</Label>}
        >
          <p className="typography-content-body-sm">{nameOnAccount}</p>
        </FieldData>
      </div>
    </div>
  );
};
