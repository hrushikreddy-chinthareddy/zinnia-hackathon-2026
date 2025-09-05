import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, {
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import { TranslationFiles } from '@deps/config/translations';
import { toSentenceCase } from '@deps/helpers/string.helpers';
import {
    NonFinancialTransactionActions,
    NonFinancialTransactions,
} from '@deps/queries/api/bpm-non-financial';
import { ReactComponent as CogIcon } from '@deps/styles/elements/icons/icons_outlined/cog.svg';

export const HELP_DESK_LINK =
    'https://zinnia.atlassian.net/servicedesk/customer/portal/6';

interface ApiErrorStateProps {
    action: NonFinancialTransactionActions;
    name: string;
    onCancel: () => void;
    onContinue: () => void;
    transaction: NonFinancialTransactions;
    type?: string;
}

const ApiErrorState = ({
    action,
    name,
    onCancel,
    onContinue,
    transaction,
    type,
}: ApiErrorStateProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.sideSheet.states.apiError',
    });
    const { t: defaultT } = useTranslation();

    const actionMap = {
        add: 'save',
        delete: 'remove',
        edit: 'update',
    } as Record<NonFinancialTransactionActions, string>;

    const subtitle = (
        <>
            {t('subtitle.1', {
                action: defaultT(
                    `people.sideSheet.actions.${actionMap[action]}`
                ),
            })}
            <b>
                {t('subtitle.2', {
                    name,
                    transaction: defaultT(
                        `people.sideSheet.transactions.${transaction}`
                    ).toLowerCase(),
                    type,
                })}
            </b>
            {t('subtitle.3')}
            <NavElement
                href={HELP_DESK_LINK}
                target="_blank"
                type={NavElementType.Link}
                variant={NavElementVariant.Default}
                underline
            >
                {t('subtitle.4')}
            </NavElement>
            .
        </>
    );

    return (
        <CardInfo
            className="mt-8"
            cta={{
                action: onContinue,
                text: t('cta', {
                    action: toSentenceCase(
                        defaultT(
                            `people.sideSheet.actions.${actionMap[action]}`
                        ) as string
                    ),
                    transaction: defaultT(
                        `people.sideSheet.transactions.${transaction}`
                    ).toLowerCase(),
                    type,
                }),
            }}
            icon={
                <CogIcon
                    className="text-semantic-error"
                    height={50}
                    width={50}
                />
            }
            secondaryCta={
                <NavElement
                    className="font-semibold text-secondary"
                    onClick={() => onCancel()}
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
};

export default ApiErrorState;
