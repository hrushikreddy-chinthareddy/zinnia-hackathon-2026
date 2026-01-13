import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import {
    numberFormatify,
    percentFormatify,
} from '@deps/helpers/numbers.helpers';
import { AmountType } from '@deps/models/funds/enums';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

interface ConfirmProps {
    amount: number;
    caseId?: string;
    parentPage: string;
    payorPayeeName: string;
    type: string;
    isNigo: boolean;
    amountType?: AmountType;
}

const ConfirmCard = ({
    amount,
    caseId,
    isNigo,
    parentPage,
    payorPayeeName,
    type,
    amountType = AmountType.Amount,
}: ConfirmProps) => {
    const { t } = useTranslation();
    const router = useRouter();
    const { featureFlags } = useOptimizely();
    const path = usePathname();

    const systematicProgramTablesEnabled =
        featureFlags[FEATURE_FLAGS.SYSTEMATIC_PROGRAMS_TABLE];

    const amountToDisplay =
        amountType === AmountType.Amount
            ? numberFormatify(amount)
            : percentFormatify(amount, { isInteger: true });

    const subtitle = useMemo(() => {
        if (isNigo) {
            return (
                <>
                    <PiiWrapper className="font-bold">
                        {payorPayeeName}'s {numberFormatify(amount)}{' '}
                    </PiiWrapper>
                    <span className="font-bold">{type}</span>
                    {t('financialTransaction.confirm.subtitle.wasReceivedNigo')}
                </>
            );
        }

        return systematicProgramTablesEnabled ? (
            <>
                {t('allFields.financialTransactionWeReceived')}
                <PiiWrapper className="font-bold">{payorPayeeName}</PiiWrapper>
                {t('allFields.financialTransactionS')}
                {t(
                    path.includes('add-')
                        ? 'allFields.financialTransactionSetUpRequest'
                        : 'allFields.financialTransactionRequest'
                )}
                <span className="font-bold">{type}</span>
                {t('allFields.financialTransactionProgram')}
                {t('allFields.financialTransactionTrack')}
            </>
        ) : (
            <>
                {t('financialTransaction.confirm.subtitle.a')}
                <span className="font-bold">{type}</span>
                {t('financialTransaction.confirm.subtitle.requestFrom')}
                <PiiWrapper className="font-bold">{payorPayeeName}</PiiWrapper>
                {t('financialTransaction.confirm.subtitle.for')}
                <PiiWrapper className="font-bold">{amountToDisplay}</PiiWrapper>
                {t('financialTransaction.confirm.subtitle.wasReceived')}
            </>
        );
    }, [
        isNigo,
        systematicProgramTablesEnabled,
        t,
        payorPayeeName,
        type,
        amountToDisplay,
        amount,
    ]);

    return (
        <CardInfo
            cta={
                caseId
                    ? {
                          action: () => {
                              router.push(`/cases/${caseId}/progress`);
                          },
                          text: t('financialTransaction.confirm.cta'),
                      }
                    : undefined
            }
            secondaryCta={
                <NavElement
                    aria-label={
                        t('financialTransaction.confirm.secondaryCta') as string
                    }
                    onClick={() => router.push(parentPage)}
                    size={NavElementSize.Small}
                    type={NavElementType.Button}
                    variant={NavElementVariant.Default}
                >
                    {t('financialTransaction.confirm.secondaryCta')}
                </NavElement>
            }
            subtitle={subtitle}
            title={t('financialTransaction.confirm.title')}
        />
    );
};

export default ConfirmCard;
