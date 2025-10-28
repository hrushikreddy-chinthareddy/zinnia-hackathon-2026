import {
    UserActivityOutputLevel1,
    UserViewsOutputLevel1,
} from '@xd/api-types/dist/generated-types/analytics';
import { Icon, IconType, Link, Tooltip } from '@zinnia/bloom/components';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

type UsageCommonLayoutProps = {
    title: string;
    data: UserActivityOutputLevel1[] | UserViewsOutputLevel1[];
    csvFileName: string;
    csvFunction: (
        data: UserActivityOutputLevel1[] | UserViewsOutputLevel1[],
        csvFileName: string
    ) => void;
    description?: string;
    titleToolTip?: ReactNode;
};

const UsageHeaderLayout = ({
    title,
    data,
    csvFileName,
    csvFunction,
    description,
    titleToolTip,
}: UsageCommonLayoutProps) => {
    const { t } = useTranslation();
    return (
        <div className="flex justify-between items-baseline w-full">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Typography variant={TypographyVariant.H2}>
                        {title}
                    </Typography>
                    {titleToolTip && (
                        <Tooltip
                            trigger={
                                <CircleInfoIcon
                                    height={'16px'}
                                    width={'16px'}
                                    className="text-secondary"
                                />
                            }
                        >
                            {titleToolTip}
                        </Tooltip>
                    )}
                </div>

                {description &&
                    (typeof description === 'string' ? (
                        <p className="typography-content-body">{description}</p>
                    ) : (
                        description
                    ))}
            </div>
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
