import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { TranslationFiles } from '@deps/config/translations';
import { ReactComponent as HexExclamationIcon } from '@deps/styles/elements/icons/icons_outlined/hex-exclamation.svg';

interface ApiErrorCardProps {
    leaveRoute: string;
    submit: {
        action: () => void;
        text: string;
    };
}

const ApiErrorCard = ({ leaveRoute, submit }: ApiErrorCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'workflows.apiErrorCard' });
    const router = useRouter();

    const { action, text } = submit;

    return (
        <div className="responsive-padding flex h-full w-full grow flex-col items-center justify-center">
            <CardInfo
                cta={{
                    action,
                    text,
                }}
                icon={<HexExclamationIcon className="text-semantic-error" height={50} role="presentation" width={50} />}
                secondaryCta={
                    <NavElement
                        aria-label={t('leaveTransaction') as string}
                        onClick={() => router.push(leaveRoute)}
                        size={NavElementSize.Small}
                        type={NavElementType.Button}
                        variant={NavElementVariant.Default}
                    >
                        {t('leaveTransaction')}
                    </NavElement>
                }
                subtitle={
                    <>
                        {t('subtitle')}
                        <NavElement
                            className="underline"
                            href={t('helpDesk.link') as string}
                            referrerPolicy="no-referrer"
                            rel="noopener noreferrer"
                            target="_blank"
                            type={NavElementType.Link}
                        >
                            {t('helpDesk.text')}
                        </NavElement>
                    </>
                }
                title={t('title')}
            />
        </div>
    );
};

export default ApiErrorCard;
