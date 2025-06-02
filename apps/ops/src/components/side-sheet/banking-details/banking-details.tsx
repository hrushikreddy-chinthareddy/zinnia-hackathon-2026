import { BankAccount } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import Label, { LabelVariant } from '@deps/components/label/label';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { getBankAccountType } from '@deps/helpers/party-info-helpers';
import { formatAccountNumber, toTitleCase } from '@deps/helpers/string.helpers';
import { ReactComponent as CircleExclamationIcon } from '@deps/styles/elements/icons/circles/circle-exclamation.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

const BankingDetails = ({ bankDetails }: { bankDetails?: BankAccount }) => {
    const { t } = useTranslation();
    const sideSheet = useSideSheetContext();

    if (!bankDetails) {
        return (
            <CardInfo
                className="mt-4"
                icon={<CircleExclamationIcon className="text-semantic-error" height={50} width={50} />}
                title={t('sideSheet.bankingDetails.error')}
                subtitle=""
                cta={{ action: () => sideSheet.handleOpen(false), text: t('sideSheet.bankingDetails.close') }}
            />
        );
    }

    const accountNumber =
        formatAccountNumber(bankDetails.internationalBankAccountNumber ?? bankDetails.accountNumber, true) ?? DEFAULT_ERROR_STRING;

    return (
        <div className="p-8">
            <Typography variant={TypographyVariant.H2}>{t('sideSheet.bankingDetails.heading')}</Typography>
            <div className="mt-8 grid grid-cols-2 gap-8">
                <div className="flex flex-col">
                    <Label label={t('sideSheet.bankingDetails.bankName')} variant={LabelVariant.FieldLabel} />
                    <Typography variant={TypographyVariant.BodySm}>
                        <PiiWrapper>{bankDetails.branchName?.toUpperCase()}</PiiWrapper>
                    </Typography>
                </div>
                <div className="flex flex-col">
                    <Label label={t('sideSheet.bankingDetails.accountType')} variant={LabelVariant.FieldLabel} />
                    <Typography variant={TypographyVariant.BodySm}>
                        <PiiWrapper>{getBankAccountType(bankDetails.accountType, t) || DEFAULT_ERROR_STRING}</PiiWrapper>
                    </Typography>
                </div>
                <div className="flex flex-col">
                    <Label label={t('sideSheet.bankingDetails.routingNumber')} variant={LabelVariant.FieldLabel} />
                    <Typography variant={TypographyVariant.BodySm}>
                        <PiiWrapper>{bankDetails.routingNumber}</PiiWrapper>
                    </Typography>
                </div>
                <div className="flex flex-col">
                    <Label label={t('sideSheet.bankingDetails.accountNumber')} variant={LabelVariant.FieldLabel} />
                    <Typography variant={TypographyVariant.BodySm}>
                        <PiiWrapper>{t('sideSheet.bankingDetails.endingIn', { accountNumber })}</PiiWrapper>
                    </Typography>
                </div>
                <div className="flex flex-col">
                    <Label label={t('sideSheet.bankingDetails.nameOnAccount')} variant={LabelVariant.FieldLabel} />
                    <Typography variant={TypographyVariant.BodySm}>
                        <PiiWrapper>{toTitleCase(bankDetails.nameOnAccount)}</PiiWrapper>
                    </Typography>
                </div>
            </div>
        </div>
    );
};

export default BankingDetails;
