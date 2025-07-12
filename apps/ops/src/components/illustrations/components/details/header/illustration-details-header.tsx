import {
    Button,
    CarrierAvatar,
    CarrierName,
    FieldStatus,
    Heading,
    HeadingVariant,
    Icon,
    IconType,
    Label,
    MenuContextual,
    MenuContextualItem,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';

import Badge from '@deps/components/badge/badge';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import { TranslationFiles } from '@deps/config/translations';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import style from './illustration-details-header.module.css';

type IllustrationDetailsHeaderProps = {
    title?: string;
    carrier: CarrierName;
    label?: string;
    planType: string;
    eAppId?: string;
    eAppLink?: string;
};

export default function IllustrationDetailsHeader({
    title,
    carrier,
    label,
    planType,
    eAppId,
    eAppLink,
}: IllustrationDetailsHeaderProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, {});

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
                        {!!eAppId && !!eAppLink && (
                            <Label
                                interactiveElements={[
                                    <Button
                                        key={'eapp-link'}
                                        mode="link"
                                        data-testid="eapp-link-btn"
                                        aria-label={t('') as string}
                                        type="button"
                                        size="small"
                                        className={clsx(style.goToSureify)}
                                        onClick={() =>
                                            window.open(eAppLink, '_blank')
                                        }
                                    >
                                        <Icon
                                            type={IconType.EXTERNAL_LINK}
                                        ></Icon>
                                    </Button>,
                                ]}
                                status={FieldStatus.INACTIVE}
                                size="sm"
                            >
                                {`App #${eAppId}`}
                            </Label>
                        )}
                        <span>
                            <MenuContextual
                                triggerLabel={
                                    <Icon type={IconType.MENU_VERTICAL} />
                                }
                            >
                                <MenuContextualItem
                                    content="Edit"
                                    href="/"
                                    icon={
                                        <Icon
                                            type={IconType.EDIT_ALT}
                                            height={20}
                                            width={20}
                                        />
                                    }
                                />
                                <MenuContextualItem
                                    content="Duplicate"
                                    href="/"
                                    icon={
                                        <Icon
                                            type={IconType.DOCUMENT_DUPLICATE}
                                            height={20}
                                            width={20}
                                        />
                                    }
                                />
                                <MenuContextualItem
                                    content="Move"
                                    href="/"
                                    icon={
                                        <Icon
                                            type={IconType.CHEVRON_DOUBLE}
                                            height={20}
                                            width={20}
                                        />
                                    }
                                />
                                <MenuContextualItem
                                    content="Archive"
                                    href="/"
                                    icon={
                                        <Icon
                                            type={IconType.FOLDER}
                                            height={20}
                                            width={20}
                                        />
                                    }
                                />
                                <MenuContextualItem
                                    content="Select for Application"
                                    href="/"
                                    icon={
                                        <Icon
                                            type={IconType.CIRCLE_CHECKMARK}
                                            height={20}
                                            width={20}
                                        />
                                    }
                                />
                            </MenuContextual>
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
