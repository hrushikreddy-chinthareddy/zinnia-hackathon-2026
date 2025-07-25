import { UserViewsOutputLevel1 } from '@xd/api-types/dist/generated-types/analytics';
import { Icon, IconType, Link } from '@zinnia/bloom/components';
import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';

import { PrepareUserViewsCSV } from './utils';

type PageViewsCommonLayoutProps = {
    title: string;
    data: UserViewsOutputLevel1[];
    csvFileName: string;
};

const PageViewsHeaderLayout = ({
    title,
    data,
    csvFileName,
}: PageViewsCommonLayoutProps) => {
    const { t } = useTranslation();
    return (
        <div className="flex justify-between items-center w-full">
            <Typography variant={TypographyVariant.H2}>{title}</Typography>
            <div
                className="flex items-center gap-2"
                onClick={() => {
                    data.length && PrepareUserViewsCSV(data, csvFileName);
                }}
            >
                <Icon type={IconType.DOWNLOAD} />
                <Link href={'#'} text={t('usage.exportToCSV')} />
            </div>
        </div>
    );
};

export default PageViewsHeaderLayout;
