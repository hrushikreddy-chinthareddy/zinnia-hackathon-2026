import { BankDetail } from '@zinnia/api-types/types/aggregation';
import { BankAccount } from '@zinnia/api-types/types/sor';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';

import ClickContainer from '@deps/components/click-container/click-container';
import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { getBankAccountType } from '@deps/helpers/party-info-helpers';
import { formatAccountNumber } from '@deps/helpers/string.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

export interface BankDataCardProps {
    bankDetails: BankAccount | BankDetail;
    accessibilityClickText: string;
    onCardClick?: (id: string | undefined) => void;
    selectedId?: string;
}

interface BranchNameAndTypeProps {
    bankDetails: BankAccount | BankDetail;
    bankAccountType: string;
}

const BranchNameAndType = ({
    bankDetails,
    bankAccountType,
}: BranchNameAndTypeProps) => {
    const { branchName } = bankDetails;

    return (
        <div
            className="mb-4 flex flex-col items-start"
            data-testid="branch-name-and-type"
        >
            <Label
                pii={true}
                className="text-gray-900"
                label={branchName?.toUpperCase() ?? ''}
                sentenceCase={false}
                variant={LabelVariant.LabelLg}
            />
            <Label
                pii={true}
                className="leading-4.5 text-gray-600"
                label={bankAccountType}
                variant={LabelVariant.LabelSmAlt}
            />
        </div>
    );
};

const AccountNumber = ({
    bankDetails,
}: Pick<BankDataCardProps, 'bankDetails'>) => {
    const { accountNumber, internationalBankAccountNumber } = bankDetails;
    const { t } = useTranslation();

    return (
        <div className=" mr-4 flex flex-col items-start">
            <Label
                className="leading-4.5 text-gray-900"
                label={t('workflows.paymentStep.bankDataCard.accountNumber')}
                variant={LabelVariant.FieldLabel}
            />

            <Content
                className="leading-[26px] text-gray-900"
                pii={true}
                details={
                    t('workflows.paymentStep.bankDataCard.endingIn') +
                    (formatAccountNumber(
                        internationalBankAccountNumber ?? accountNumber,
                        true
                    ) ?? DEFAULT_ERROR_STRING)
                }
                variant={ContentVariant.BodySm}
            />
        </div>
    );
};

const BankDataCard = ({
    bankDetails,
    accessibilityClickText = '',
    onCardClick,
    selectedId,
}: BankDataCardProps) => {
    const { t } = useTranslation();
    const { branchName, accountType } = bankDetails;
    const upperCaseBranchName = branchName?.toUpperCase();
    const bankAccountType = getBankAccountType(accountType, t, true);

    const handleClick = () => {
        if (onCardClick) {
            onCardClick(bankDetails.bankId);
        }
    };

    const isSelected = bankDetails.bankId === selectedId;
    const selectedClass = clsx('w-full', {
        'border-primary hover:border-primary ': isSelected,
    });

    return (
        <ClickContainer
            classes={selectedClass}
            onClick={handleClick}
            ariaLabel={`${accessibilityClickText} ${upperCaseBranchName} ${bankAccountType}`}
        >
            <BranchNameAndType
                bankDetails={bankDetails}
                bankAccountType={bankAccountType}
            />
            <div className="flex">
                <AccountNumber bankDetails={bankDetails} />
            </div>
        </ClickContainer>
    );
};

export default BankDataCard;
