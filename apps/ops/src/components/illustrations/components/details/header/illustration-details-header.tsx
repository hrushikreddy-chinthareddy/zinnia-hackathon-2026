import {
    CarrierAvatar,
    CarrierName,
    Heading,
    HeadingVariant,
    Icon,
    IconType,
    Tooltip,
    TooltipPlacement,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';

import Badge from '@deps/components/badge/badge';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import { TranslationFiles } from '@deps/config/translations';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import style from './illustration-details-header.module.css';
import IllustrationMenu from '../../case-details/illustration-item/illustration-menu';

type IllustrationDetailsHeaderProps = {
    title?: string;
    carrier: CarrierName;
    label?: string;
    planType: string;
    eAppId?: string;
    eAppLink?: string;
    hasIllustrationSelected?: boolean;
};

export default function IllustrationDetailsHeader({
    title,
    carrier,
    label,
    planType,
    eAppId,
    eAppLink,
    hasIllustrationSelected,
}: IllustrationDetailsHeaderProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    const eappHtmlLink = (
        <a
            aria-disabled={hasIllustrationSelected}
            key={'eapp-link'}
            data-testid="eapp-link"
            aria-label={
                t('clientCase.illustrationDetails.ariaGoToEApp') as string
            }
            className={clsx(
                style.goToSureify,
                hasIllustrationSelected && style.enabled
            )}
            href={hasIllustrationSelected ? eAppLink : undefined}
            role={!hasIllustrationSelected ? 'link' : undefined}
            rel="noreferrer"
            target="_blank"
        >
            <span>
                {`App #${eAppId}`}
                <Icon type={IconType.EXTERNAL_LINK}></Icon>
            </span>
        </a>
    );

    return (
        <div className={style.headerWrapper}>
            <CarrierAvatar carrier={carrier} height={48} width={48} />
            <div className={style.headerContent}>
                <div className={style.topLine}>
                    <div className={style.centerLine}>
                        <Badge variant={BadgeVariant.Brand} label={planType} />
                        <div className="typography-content-body-sm">
                            {label ?? DEFAULT_ERROR_STRING}
                        </div>
                    </div>
                    <div className={style.centerLine}>
                        {!!eAppId &&
                            !!eAppLink &&
                            (hasIllustrationSelected ? (
                                eappHtmlLink
                            ) : (
                                <Tooltip
                                    placement={TooltipPlacement.BottomLeft}
                                    trigger={eappHtmlLink}
                                >
                                    {
                                        t(
                                            'clientCase.illustrationDetails.selectBeforeGoToEApp'
                                        ) as string
                                    }
                                </Tooltip>
                            ))}
                        <span>
                            <IllustrationMenu
                                isSelectForApplicationVisible={!!eAppId}
                            ></IllustrationMenu>
                        </span>
                    </div>
                </div>
                <Heading as={HeadingVariant.h2}>
                    {title ?? DEFAULT_ERROR_STRING}
                </Heading>
            </div>
        </div>
    );
}
