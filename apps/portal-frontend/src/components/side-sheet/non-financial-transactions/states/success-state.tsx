import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import { TranslationFiles } from '@deps/config/translations';
import { NonFinancialTransactionActions, NonFinancialTransactions } from '@deps/queries/api/bpm-non-financial';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';

interface SuccessStateProps {
    action: NonFinancialTransactionActions;
    isNigo?: boolean;
    name: string;
    onCancel: () => void;
    transaction: NonFinancialTransactions;
    type?: string;
}

const SuccessState = ({ action, isNigo, name, onCancel, transaction, type }: SuccessStateProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'people.sideSheet.states.success' });
    const { t: defaultT } = useTranslation();

    const actionMap = {
        add: 'saved',
        delete: 'removed',
        edit: 'updated',
    } as Record<NonFinancialTransactionActions, string>;

    const cta = { action: onCancel, text: defaultT('general.close') };
    const icon = <CircleCheckIcon className="text-semantic-success" height={50} width={50} />;

    if (isNigo) return <CardInfo className="mt-8" cta={cta} icon={icon} subtitle={t('subtitle.nigo')} title={t('title.submitted')} />;

    const bankingSubtitle = (
        <span>
            <b>{name}</b>
            {t('subtitle.bank')}
        </span>
    );

    const defaultSubtitle = (
        <span>
            <b>
                {t('subtitle.default.1', {
                    name,
                    transaction,
                    type,
                })}
            </b>
            {t('subtitle.default.2', {
                action: defaultT(`people.sideSheet.actions.${actionMap[action]}`),
            })}
        </span>
    );

    const subtitle = transaction === NonFinancialTransactions.BankAccount ? bankingSubtitle : defaultSubtitle;

    return <CardInfo className="mt-8" cta={cta} icon={icon} subtitle={subtitle} title={t('title.success')} />;
};

export default SuccessState;
