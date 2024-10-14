import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, { NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { ReactComponent as CircleExclamationIcon } from '@deps/styles/elements/icons/circles/circle-exclamation.svg';

const SearchResultsEmptyCard = () => {
    const { t } = useTranslation();

    return (
        <div className="flex h-[500px] w-full items-center justify-center rounded border-2 border-dashed border-gray-200 bg-white shadow-sm">
            <CardInfo
                icon={<CircleExclamationIcon role=" presentation" className="text-semantic-error" height={50} width={50} />}
                title={t('dashboard.search.empty.title')}
                subtitle={t('dashboard.search.empty.paragraph')}
                secondaryCta={
                    <p className="mt-5 flex flex-col items-center font-secondary text-base font-normal">
                        {t('dashboard.search.empty.action.text')}
                        <NavElement
                            className="font-semibold text-secondary"
                            href={t('dashboard.search.empty.action.link') as string}
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
