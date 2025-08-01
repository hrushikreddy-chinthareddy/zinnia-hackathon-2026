import {
    UserActivityOutputLevel1,
    UserViewsOutputLevel1,
} from '@xd/api-types/dist/generated-types/analytics';
import { Icon, IconType, Link } from '@zinnia/bloom/components';
import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';

type UsageCommonLayoutProps = {
    title: string;
    data: UserActivityOutputLevel1[] | UserViewsOutputLevel1[];
    csvFileName: string;
    csvFunction: (
        data: UserActivityOutputLevel1[] | UserViewsOutputLevel1[],
        csvFileName: string
    ) => void;
};

const UsageHeaderLayout = ({
    title,
    data,
    csvFileName,
    csvFunction,
}: UsageCommonLayoutProps) => {
    const { t } = useTranslation();
    return (
        <div className="flex justify-between items-center w-full">
            <Typography variant={TypographyVariant.H2}>{title}</Typography>
            <div
                className="flex items-center gap-2"
                onClick={() => {
                    data.length && csvFunction(data, csvFileName);
                }}
            >
                <Icon type={IconType.DOWNLOAD} />
                <Link href={'#'} text={t('usage.logins.exportToCSV')} />
            </div>
        </div>
    );
};

export default UsageHeaderLayout;
