import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, {
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import { TranslationFiles } from '@deps/config/translations';
import { ReactComponent as HexExclamationIcon } from '@deps/styles/elements/icons/icons_outlined/hex-exclamation.svg';

export const HELP_DESK_LINK =
    'https://zinnia.atlassian.net/servicedesk/customer/portal/6';

interface ApiErrorStateProps {
    onCancel: () => void;
    onContinue: () => void;
}

const ApiErrorState = ({ onCancel, onContinue }: ApiErrorStateProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'transactions.states.apiError',
    });

    const subtitle = (
        <>
            {t('subtitle.1')}
            {t('subtitle.2')}
            <NavElement
                href={HELP_DESK_LINK}
                target="_blank"
                type={NavElementType.Link}
                variant={NavElementVariant.Default}
            >
                {t('subtitle.3')}
            </NavElement>
        </>
    );

    return (
        <CardInfo
            className="mt-8"
            cta={{
                action: onContinue,
                text: t('cta'),
            }}
            icon={
                <HexExclamationIcon
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
