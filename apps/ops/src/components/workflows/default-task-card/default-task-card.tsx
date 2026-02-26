import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import { ReactComponent as ErrorIcon } from '@deps/styles/elements/icons/icons_outlined/exclamation-alert.svg';

import styles from './default-task-card.module.css';
interface DefaultTaskCardProps {
    leaveRoute: string;
}

const DefaultTaskCard = ({ leaveRoute }: DefaultTaskCardProps) => {
    const { t } = useTranslation();
    const router = useRouter();

    return (
        <div className={styles.container}>
            <CardInfo
                icon={
                    <ErrorIcon
                        className="text-semantic-warning"
                        height={50}
                        width={50}
                    />
                }
                secondaryCta={
                    <NavElement
                        aria-label={t('allFields.leaveTransaction') ?? ''}
                        onClick={() => router.push(leaveRoute)}
                        size={NavElementSize.Small}
                        type={NavElementType.Button}
                        variant={NavElementVariant.Default}
                    >
                        {t('allFields.leaveTransaction')}
                    </NavElement>
                }
                subtitle={
                    <>
                        {t('allFields.defaultTaskCardSubtitle')}
                        <NavElement
                            className="underline"
                            href={t('allFields.helpDeskLink') ?? ''}
                            referrerPolicy="no-referrer"
                            rel="noopener noreferrer"
                            target="_blank"
                            type={NavElementType.Link}
                            underline
                        >
                            {t('allFields.helpDesk')}
                        </NavElement>
                    </>
                }
                title={t('allFields.defaultTaskCardTitle')}
            />
        </div>
    );
};

export default DefaultTaskCard;
