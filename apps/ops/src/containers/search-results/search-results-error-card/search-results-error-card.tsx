import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, {
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import { ReactComponent as CogIcon } from '@deps/styles/elements/icons/icons_outlined/cog.svg';

import { default as styles } from './../search-results.module.css';

const SearchResultsErrorCard = () => {
    const { t } = useTranslation();

    return (
        <div className={styles.messageCard}>
            <CardInfo
                icon={
                    <CogIcon
                        className="text-semantic-error"
                        height={50}
                        width={50}
                    />
                }
                title={t('dashboard.search.error.title')}
                subtitle={t('dashboard.search.error.paragraph')}
                secondaryCta={
                    <p className={styles.secondaryText}>
                        {t('dashboard.search.error.action.text')}
                        <NavElement
                            className={styles.linkText}
                            href={
                                t(
                                    'dashboard.search.error.action.link'
                                ) as string
                            }
                            referrerPolicy="no-referrer"
                            rel="noopener noreferrer"
                            target="_blank"
                            type={NavElementType.Link}
                            variant={NavElementVariant.Text}
                        >
                            {t('dashboard.search.error.action.linkText')}
                        </NavElement>
                    </p>
                }
            />
        </div>
    );
};

export default SearchResultsErrorCard;
