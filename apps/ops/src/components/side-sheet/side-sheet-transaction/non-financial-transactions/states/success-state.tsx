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

interface SuccessStateProps {
    action: NonFinancialTransactionActions;
    isNigo?: boolean;
    name: string;
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
}: SuccessStateProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.sideSheet.states.success',
    });
    const { t: defaultT } = useTranslation();
    const router = useRouter();

    const actionMap = {
        add: 'save',
        delete: 'remove',
        edit: 'update',
    } as Record<NonFinancialTransactionActions, string>;

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
            <b>
                {t('subtitle.default.1', {
                    name,
                })}
            </b>
            {t('subtitle.default.2')}
            <b>
                {t('subtitle.default.3', {
                    transaction: defaultT(
                        `people.sideSheet.transactions.${transaction}`
                    ).toLowerCase(),
                    type,
                    action: defaultT(
                        `people.sideSheet.actions.${actionMap[action]}`
                    ),
                })}
            </b>
            {t('subtitle.default.4')}
        </span>
    );

    const subtitle = defaultSubtitle;

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
            subtitle={subtitle}
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
