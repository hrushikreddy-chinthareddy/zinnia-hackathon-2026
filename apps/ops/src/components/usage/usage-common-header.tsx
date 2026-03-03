import { Icon, IconType, Tooltip, Button } from '@zinnia/bloom/components';
import { TFunction } from 'i18next';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';
import {
    UserActivityOutputLevel1,
    UserIllustrationActivityOutputLevel1,
    UserViewsOutputLevel1,
} from '@zinnia/api-types/types/analytics';

type UsageCommonLayoutProps = {
    title: string;
    data: UserActivityOutputLevel1[] | UserViewsOutputLevel1[];
    csvFileName: string;
    csvFunction: (
        data:
            | UserActivityOutputLevel1[]
            | UserViewsOutputLevel1[]
            | UserIllustrationActivityOutputLevel1[],
        csvFileName: string,
        t?: TFunction
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
                                <span tabIndex={0}>
                                    <CircleInfoIcon
                                        height={'16px'}
                                        width={'16px'}
                                        className="tooltip-secondary"
                                        color="var(--color-links-color-global-link)"
                                    />
                                </span>
                            }
                            triggerClassName="w-fit"
                            replaceElement
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
            <Button
                mode="link"
                size="small"
                onClick={() => {
                    data.length && csvFunction(data, csvFileName, t);
                }}
            >
                <Icon type={IconType.DOWNLOAD} color="black" />
                <span>{t('allFields.exportToCsv')}</span>
            </Button>
        </div>
    );
};

export default UsageHeaderLayout;
