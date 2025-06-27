import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import { TranslationFiles } from '@deps/config/translations';

interface SuccessStateProps {
    caseId?: string;
    isNigo?: boolean;
    onCancel: () => void;
    transactionType: string;
}

const SuccessState = ({
    caseId,
    transactionType,
    isNigo,
    onCancel,
}: SuccessStateProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'transactions.states.success',
    });
    const { t: defaultT } = useTranslation();
    const router = useRouter();

    if (isNigo) {
        return (
            <CardInfo
                className="mt-8"
                cta={{ action: onCancel, text: defaultT('general.close') }}
                subtitle={t('subtitle.nigo')}
                title={t('title')}
            />
        );
    }

    return (
        <CardInfo
            className="mt-8"
            cta={
                caseId
                    ? {
                          action: () => {
                              router.push(`/cases/${caseId}/progress`);
                          },
                          text: t('cta'),
                      }
                    : undefined
            }
            secondaryCta={
                <NavElement
                    onClick={onCancel}
                    size={NavElementSize.Small}
                    type={NavElementType.Button}
                    variant={NavElementVariant.Default}
                >
                    {defaultT('general.close')}
                </NavElement>
            }
            subtitle={
                <>
                    <span className="font-bold">{transactionType}</span>
                    {t('subtitle.1')}
                    {t('subtitle.2')}
                    {t('subtitle.3')}
                </>
            }
            title={t('title')}
        />
    );
};

export default SuccessState;
