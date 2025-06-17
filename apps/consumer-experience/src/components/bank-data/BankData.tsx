'use client';

import {
  Label,
  AssistiveText,
  AssistiveTextVariant,
} from '@zinnia/bloom/components';

import { FieldData } from '@/components/field-data/FieldData';
import { AccountNumber } from '@/components/pii/AccountNumber';
import { AccountType } from '@/components/pii/AccountType';
import { BankName } from '@/components/pii/BankName';
import { Name } from '@/components/pii/Name';
import { RoutingNumber } from '@/components/pii/RoutingNumber';
import { ApiResponseError } from '@/services';

import styles from './BankData.module.css';
import { EditBankSidesheet } from '../edit-bank/EditBankSidesheet';
import { RemoveBankSidesheet } from '../remove-bank/RemoveBankSidesheet';

interface BaseBankDetailProps {
  accountNumber?: string;
  branchName?: string;
  nameOnAccount?: string;
  routingNumber?: string;
  numberOfAccounts: number;
  accountType?: string;
  autopayEnabled?: boolean;
  editBankEnabled?: boolean;
  checkVerification?: boolean;
}

interface BankDetailWithRemoveBank extends BaseBankDetailProps {
  removeBankEnabled: boolean;
  onRemoveBank: () => Promise<{
    data: { title: string; message: string };
    error: ApiResponseError | null;
  }>;
}

interface BankDetailWithoutRemoveBank extends BaseBankDetailProps {
  removeBankEnabled?: boolean;
  onRemoveBank?: never;
}

type BankDetailProps = BankDetailWithRemoveBank | BankDetailWithoutRemoveBank;

export const BankData = ({
  accountNumber,
  accountType,
  autopayEnabled,
  branchName,
  nameOnAccount,
  routingNumber,
  removeBankEnabled,
  numberOfAccounts,
  onRemoveBank,
  editBankEnabled,
  checkVerification,
}: BankDetailProps) => {
  return (
    <div>
      <div className={styles.bankName}>
        <div className="typography-labels-label-lg justify-between">
          <BankName bankName={branchName} />
          <div className={styles.bankActions}>
            {editBankEnabled && <EditBankSidesheet />}
            {removeBankEnabled && onRemoveBank && (
              <RemoveBankSidesheet
                autopayEnabled={autopayEnabled}
                numberOfAccounts={numberOfAccounts}
                onRemoveBank={onRemoveBank}
                checkVerification={checkVerification}
                values={{
                  accountNumber,
                  accountType,
                  routingNumber,
                  branchName,
                }}
              />
            )}
          </div>
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
        {routingNumber && (
          <FieldData Label={<Label>Routing number</Label>}>
            <p className="typography-content-body-sm">
              <RoutingNumber routingNumber={routingNumber} />
            </p>
          </FieldData>
        )}

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
