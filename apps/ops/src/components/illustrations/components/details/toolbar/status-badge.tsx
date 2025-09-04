import { Badge, BadgeVariant, Icon, IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { IllustrationStatus } from '@deps/types/illustrations';

type IllustrationDetailsStatusBadgeProps = {
    status: IllustrationStatus;
};

function keyNarrower<T extends object>(
    obj: T,
    key: PropertyKey
): key is keyof T {
    return Object.hasOwn(obj, key);
}

export default function IllustrationDetailsStatusBadge({
    status,
}: IllustrationDetailsStatusBadgeProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    const statusMap = {
        Submitted: {
            variant: BadgeVariant.SUCCESS,
            labelPath: t('clientCase.illustrationDetails.selected'),
            icon: IconType.CIRCLE_CHECKMARK,
        },
        Archived: {
            variant: BadgeVariant.INACTIVE,
            labelPath: t('clientCase.illustrationDetails.archived'),
            icon: IconType.BOOKMARK,
        },
        Expired: {
            variant: BadgeVariant.ERROR,
            labelPath: t('clientCase.illustrationDetails.expired'),
            icon: IconType.CLOCK,
        },
    } as const;

    if (!keyNarrower(statusMap, status)) {
        return null;
    }

    const { variant, labelPath, icon } = statusMap[status];

    return (
        <Badge
            className="flex items-center gap-2"
            variant={variant}
            label={
                (
                    <>
                        <Icon type={icon} height={16} width={16} />
                        {t(labelPath)}
                    </>
                ) as unknown as string
            }
        />
    );
}
