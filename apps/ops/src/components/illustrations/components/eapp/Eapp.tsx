// import { Typography, Icon, IconType } from '@zinnia/bloom/components';
import {
    CarrierAvatar,
    CarrierName,
    Heading,
    HeadingVariant,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { ReactElement } from 'react';

import Badge from '@deps/components/badge/badge';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import IconButton from '@deps/components/icon-button/icon-button';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { ReactComponent as CancelIcon } from '@deps/styles/elements/icons/actions/cancel.svg';
import { ProductTypeLabel, ProductTypes } from '@deps/types/product';

import style from './eapp.module.css';
import { Menu } from './menu/menu';
import { SectionView } from './section-view/SectionView';
import { Sidebar } from './sidebar/sidebar';
import { useActiveSection } from '../../providers/ActiveSectionProvider';

export interface EappProps {
    carrier: string;
    label: string;
    planCode: string;
    planType: ProductTypes;
}
export function Eapp(props: EappProps): ReactElement | null {
    const { t } = useTranslation();
    const { activeSection } = useActiveSection();
    const sideSheet = useSideSheetContext();

    if (!activeSection) {
        return null;
    }

    const productTypeLabel = props.planType
        ? ProductTypeLabel.get(props.planType)
        : '';

    return (
        <div className={style.eApp}>
            <div className={style.headerWrapper}>
                <div className={style.infoHeaderWrapper}>
                    <CarrierAvatar
                        carrier={props.carrier as CarrierName}
                        height={48}
                        width={48}
                    />
                    <div>
                        <div className={style.infoHeader}>
                            {productTypeLabel && (
                                <Badge
                                    variant={BadgeVariant.Brand}
                                    label={productTypeLabel}
                                />
                            )}
                            <div
                                className={`--typography-labels-label-lg-alt ${style.headerSubtitle}`}
                            >
                                {props.label}
                            </div>
                        </div>
                        <div>
                            <Heading as={HeadingVariant.h2}>
                                {sideSheet.header}
                            </Heading>
                        </div>
                    </div>
                    <div className="ml-auto">
                        <IconButton
                            onClick={sideSheet.onClose}
                            aria-label={t('ariaLabel.closeSideSheet') as string}
                            data-testid="close-button"
                        >
                            <CancelIcon width={24} height={24} />
                        </IconButton>
                    </div>
                </div>
                <div className={style.sidebarWrapper}>
                    <Menu />
                </div>
            </div>
            <div className={style.applicationWrapper}>
                <div className={style.layoutWrapper}>
                    <div className={style.applicationBody}>
                        <SectionView section={activeSection} />
                    </div>
                    <div className={style.applicationSidebar}>
                        <Sidebar />
                    </div>
                </div>
            </div>
        </div>
    );
}
