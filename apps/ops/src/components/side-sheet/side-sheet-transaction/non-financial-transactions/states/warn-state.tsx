import { toTitleCase } from '@zinnia/utils';
import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, {
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import { TranslationFiles } from '@deps/config/translations';
import { NonFinancialTransactions } from '@deps/queries/api/bpm-non-financial';
import { ReactComponent as AlertExclamationIcon } from '@deps/styles/elements/icons/alert/alert-exclamation.svg';

interface WarnStateProps {
    isMailingAddress?: boolean;
    name: string;
    onCancel: () => void;
    onContinue: () => void;
    transaction: NonFinancialTransactions;
    type?: string;
}

const WarnState = ({
    isMailingAddress,
    name,
    onCancel,
    onContinue,
    transaction,
    type,
}: WarnStateProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.sideSheet.states.warn',
    });
    const { t: defaultT } = useTranslation();

    const subtitle = isMailingAddress ? (
        t('subtitle.mailingAddress')
    ) : (
        <>
            <b>
                {t('subtitle.default.1', {
                    name,
                    transaction: defaultT(
                        `people.sideSheet.transactions.${transaction}`
                    ).toLowerCase(),
                    type,
                })}
            </b>
            {t('subtitle.default.2')}
        </>
    );

    return (
        <CardInfo
            className="mt-8"
            cta={{
                action: onContinue,
                text: t('cta', {
                    transaction: defaultT(
                        `people.sideSheet.transactions.${transaction}`
                    ).toLowerCase(),
                    type,
                }),
            }}
            icon={
                <AlertExclamationIcon
                    className="text-semantic-warning"
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
            title={t('title', {
                transaction: toTitleCase(
                    defaultT(`people.sideSheet.transactions.${transaction}`) ??
                        ''
                ),
            })}
        />
    );
};

export default WarnState;
