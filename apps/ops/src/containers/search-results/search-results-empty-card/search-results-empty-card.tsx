import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, {
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import { ReactComponent as CircleExclamationIcon } from '@deps/styles/elements/icons/circles/circle-exclamation.svg';

import { default as styles } from './../search-results.module.css';

const SearchResultsEmptyCard = () => {
    const { t } = useTranslation();

    return (
        <div className={styles.messageCard}>
            <CardInfo
                icon={
                    <CircleExclamationIcon
                        role=" presentation"
                        className="text-semantic-error"
                        height={50}
                        width={50}
                    />
                }
                title={t('dashboard.search.empty.title')}
                subtitle={t('dashboard.search.empty.paragraph')}
                secondaryCta={
                    <p className={styles.secondaryText}>
                        {t('dashboard.search.empty.action.text')}
                        <NavElement
                            className={styles.linkText}
                            href={
                                t(
                                    'dashboard.search.empty.action.link'
                                ) as string
                            }
                            referrerPolicy="no-referrer"
                            rel="noopener noreferrer"
                            target="_blank"
                            type={NavElementType.Link}
                            variant={NavElementVariant.Text}
                        >
                            {t('dashboard.search.empty.action.linkText')}
                        </NavElement>
                    </p>
                }
            />
        </div>
    );
};

export default SearchResultsEmptyCard;
