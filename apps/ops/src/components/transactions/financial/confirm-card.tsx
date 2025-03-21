import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import CardInfo from "@deps/components/card/card-info/card-info";
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from "@deps/components/nav-element/nav-element";
import { PiiWrapper } from "@deps/components/pii/PiiWrapper";
import { TranslationFiles } from "@deps/config/translations";
import { numberFormatify } from "@deps/helpers/numbers.helper";

interface ConfirmProps {
    amount: number;
    caseId?: string;
    parentPage: string;
    payorPayeeName: string;
    type: string;
    isNigo: boolean;
}

const ConfirmCard = ({ amount, caseId, isNigo, parentPage, payorPayeeName, type }: ConfirmProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'financialTransaction.confirm' });
    const router = useRouter();

    const subtitle = useMemo(() => {
        if (isNigo) {
            return (
                <>
                    <PiiWrapper className="font-bold">{payorPayeeName}'s {numberFormatify(amount)} </PiiWrapper>
                    <span className="font-bold">{type}</span>
                    {t('subtitle.wasReceivedNigo')}
                </>
            );
        }

        return (
            <>
                {t('subtitle.a')}
                <span className="font-bold">{type}</span>
                {t('subtitle.requestFrom')}
                <PiiWrapper className="font-bold">{payorPayeeName}</PiiWrapper>
                {t('subtitle.for')}
                <PiiWrapper className="font-bold">{numberFormatify(amount)}</PiiWrapper>
                {t('subtitle.wasReceived')}
            </>
        );
    }, [amount, isNigo, payorPayeeName, t, type]);

    return (
        <CardInfo
            cta={caseId ? {
                action: () => {
                    router.push(`/cases/${caseId}/progress`);
                },
                text: t('cta'),
            } : undefined}
            secondaryCta={
                <NavElement
                    aria-label={t('secondaryCta') as string}
                    onClick={() => router.push(parentPage)}
                    size={NavElementSize.Small}
                    type={NavElementType.Button}
                    variant={NavElementVariant.Default}
                >
                    {t('secondaryCta')}
                </NavElement>
            }
            subtitle={subtitle}
            title={t('title')}
        />
    );
}

export default ConfirmCard;
