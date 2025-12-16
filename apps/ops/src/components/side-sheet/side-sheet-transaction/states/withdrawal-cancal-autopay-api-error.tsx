import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, {
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { ReactComponent as CogIcon } from '@deps/styles/elements/icons/icons_outlined/cog.svg';
import { ArrangementType } from '@zinnia/api-types/types/sor';

export const HELP_DESK_LINK =
    'https://zinnia.atlassian.net/servicedesk/customer/portal/6';

interface ApiErrorStateProps {
    onCancel: () => void;
    onContinue: () => void;
    arrangementType: ArrangementType;
}

const WithdrawalApiErrorState = ({
    onCancel,
    arrangementType,
}: ApiErrorStateProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'transactions.states.apiErrorWithdrawal',
    });

    const subtitle = (
        <>
            {t('subtitle1')}
            <Typography variant={TypographyVariant.BodyBold} className="inline">
                {arrangementType === ArrangementType.WITHDRAWAL
                    ? t('subtitleWithdrawal')
                    : t('subtitleRmd')}
            </Typography>
            {t('subtitle2')}
            <NavElement
                href={HELP_DESK_LINK}
                target="_blank"
                type={NavElementType.Link}
                variant={NavElementVariant.Default}
                underline
            >
                {t('subtitle3')}
            </NavElement>
        </>
    );

    return (
        <CardInfo
            className="mt-8"
            icon={
                <CogIcon
                    className="text-semantic-error"
                    height={50}
                    width={50}
                />
            }
            secondaryCta={
                <NavElement
                    className="font-semibold text-secondary pt-10"
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

export default WithdrawalApiErrorState;
