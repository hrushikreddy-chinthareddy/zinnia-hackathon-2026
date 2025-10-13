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
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { ProductTypeLabel, ProductTypes } from '@deps/types/product';

import style from './illustration-details-header.module.css';
import { useSelectedIllustration } from '../../../providers/SelectedIllustrationProvider';
import IllustrationMenu from '../../case-details/illustration-item/illustration-menu';

type IllustrationDetailsHeaderProps = {
    title?: string;
    carrier: CarrierName;
    label?: string;
    eAppId?: string;
    eAppLink?: string;
    hasIllustrationSelected?: boolean;
};

export default function IllustrationDetailsHeader({
    title,
    carrier,
    eAppId,
    eAppLink,
    hasIllustrationSelected,
}: IllustrationDetailsHeaderProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const { selectedIllustration } = useSelectedIllustration();
    const { product } = selectedIllustration ?? {};
    const planType =
        ProductTypeLabel.get(product?.productType ?? ProductTypes.TERM) ??
        DEFAULT_ERROR_STRING;

    const eappHtmlLink = eAppLink ? (
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
                <Icon type={IconType.EXTERNAL_LINK} />
            </span>
        </a>
    ) : (
        <Typography
            variant={TypographyVariant.LabelAlt}
            className={style.eAppIdLabel}
        >{`App #${eAppId}`}</Typography>
    );

    return (
        <div className={style.headerWrapper}>
            <CarrierAvatar carrier={carrier} height={48} width={48} />
            <div className={style.headerContent}>
                <div className={style.topLine}>
                    <div className={style.centerLine}>
                        <Badge variant={BadgeVariant.Brand} label={planType} />
                        <div className="typography-content-body-sm">
                            {product?.productMarketingName ??
                                DEFAULT_ERROR_STRING}
                        </div>
                    </div>
                    <div className={style.centerLine}>
                        {!!eAppId &&
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
                            />
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
