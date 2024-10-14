import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import { TranslationFiles } from '@deps/config/translations';
import { ReactComponent as StarsIcon } from '@deps/styles/elements/icons/icons_outlined/sparkles.svg';

const SearchResultsStartCard = () => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    return (
        <div className="flex h-[500px] w-full items-center justify-center rounded border-2 border-dashed border-gray-200 bg-white shadow-sm">
            <CardInfo
                icon={<StarsIcon className="text-primary" height={50} width={50} />}
                title={t('dashboard.search.start.title')}
                subtitle={t('dashboard.search.start.paragraph')}
            />
        </div>
    );
};

export default SearchResultsStartCard;
