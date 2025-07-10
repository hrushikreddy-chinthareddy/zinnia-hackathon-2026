import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import { TranslationFiles } from '@deps/config/translations';
import {
    NonFinancialTransactionActions,
    NonFinancialTransactions,
} from '@deps/queries/api/bpm-non-financial';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';

interface SuccessStateProps {
    action: NonFinancialTransactionActions;
    isNigo?: boolean;
    name: string;
    newName: string;
    oldName: string;
    onCancel: () => void;
    transaction: NonFinancialTransactions;
    type?: string;
    caseId?: string;
}

const SuccessState = ({
    action,
    isNigo,
    name,
    onCancel,
    transaction,
    type,
    caseId,
    oldName,
    newName,
}: SuccessStateProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.sideSheet.states.success',
    });
    const { t: defaultT } = useTranslation();
    const router = useRouter();

    if (isNigo)
        return (
            <CardInfo
                className="mt-8"
                cta={{ action: onCancel, text: defaultT('general.close') }}
                subtitle={t('subtitle.nigo')}
                title={t('title.submitted')}
            />
        );

    const defaultSubtitle = (
        <span>
            <b>{oldName}</b>
            {t('subtitle.default.5')}
            <b>{newName}</b>
        </span>
    );

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
            icon={<CircleCheckIcon height={50} width={50} color="#007B5A" />}
            subtitle={defaultSubtitle}
            title={t('title.success')}
            secondaryCta={
                <NavElement
                    aria-label={t('secondaryCta') as string}
                    onClick={onCancel}
                    size={NavElementSize.Small}
                    type={NavElementType.Button}
                    variant={NavElementVariant.Default}
                    className="[&:only-of-type]:mt-4"
                >
                    {defaultT('general.close')}
                </NavElement>
            }
        />
    );
};

export default SuccessState;
