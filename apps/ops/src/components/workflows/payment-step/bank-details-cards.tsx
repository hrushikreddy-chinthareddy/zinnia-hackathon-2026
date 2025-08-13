import { BankAccount } from '@zinnia/api-types/types/sor';
import { Loader } from '@zinnia/bloom/components';
import clsx from 'clsx';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import BankDataCard from '@deps/containers/small-data-card/bank-data/bank-data';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-medium.svg';

import { PaymentMethodType } from './types';

type BankDetailsCardsProps = {
    bankDetails: BankAccount[];
    bankDetailsError: boolean;
    bankDetailsLoading: boolean;
    paymentBankId?: string;
    handleSelection: (paymentMethod: PaymentMethodType) => void;
    t: (key: string) => string;
    dataTestid: string;
};
export const BankDetailsCards = ({
    bankDetails,
    bankDetailsError,
    bankDetailsLoading,
    paymentBankId,
    dataTestid,
    handleSelection,
    t,
}: BankDetailsCardsProps) => {
    const showBankingDetails =
        !bankDetailsError && !bankDetailsLoading && bankDetails?.length > 0;
    return (
        <div
            className="grid auto-rows-fr grid-cols-1 gap-4 lg:grid-cols-3"
            data-testid={dataTestid}
        >
            {showBankingDetails &&
                bankDetails?.map((details) => (
                    <BankDataCard
                        bankDetails={details}
                        onCardClick={() => {
                            handleSelection({
                                paymentAccountNumber: details.accountNumber,
                                paymentBankId: details.bankId,
                                paymentBranchName: details.branchName,
                            });
                        }}
                        key={details.bankId}
                        selectedId={paymentBankId}
                        accessibilityClickText={t('ariaLabel.select')}
                    />
                ))}
            <div
                aria-hidden
                className={clsx(
                    'flex items-center justify-center gap-1 rounded-md  px-4 py-8 text-gray-300',
                    !bankDetailsLoading &&
                        !bankDetailsError &&
                        'bg-gray-100 border-2 border-gray-200 cursor-not-allowed '
                )}
            >
                <>
                    {!bankDetailsError && bankDetails?.length > 0 && (
                        <AddIcon height={24} width={24} />
                    )}
                    <p className="font-primary text-base font-semibold">
                        {bankDetailsLoading ? (
                            <Loader />
                        ) : bankDetailsError ? (
                            <AssistiveText
                                text={t('workflows.paymentStep.getBankError')}
                                variant={AssistiveTextVariant.Error}
                            />
                        ) : bankDetails?.length > 0 ? (
                            t('workflows.paymentStep.addBank')
                        ) : (
                            t('workflows.paymentStep.getBankEmpty')
                        )}
                    </p>
                </>
            </div>
        </div>
    );
};
