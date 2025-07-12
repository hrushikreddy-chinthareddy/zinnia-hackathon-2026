// import { Typography, Icon, IconType } from '@zinnia/bloom/components';
import { CarrierAvatar, CarrierName } from '@zinnia/bloom/components';
import { ReactElement } from 'react';

import Badge from '@deps/components/badge/badge';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';

import style from './eapp.module.css';
import { Menu } from './menu/menu';
import { SectionView } from './section-view/SectionView';
import { Sidebar } from './sidebar/sidebar';
import { useActiveSection } from '../../providers/ActiveSectionProvider';

export interface EappProps {
    carrier: string;
    label: string;
    planCode: string;
    planType: string;
}
export function Eapp(props: EappProps): ReactElement | null {
    const { activeSection } = useActiveSection();

    if (!activeSection) {
        return null;
    }

    return (
        <div className={style.eApp}>
            <div className={style.headerWrapper}>
                <div className={style.infoHeaderWrapper}>
                    <div className={style.infoHeader}>
                        <CarrierAvatar
                            carrier={props.carrier as CarrierName}
                            height={48}
                            width={48}
                            // className={styles.carrierLogo}
                        />
                        <Badge
                            variant={BadgeVariant.Brand}
                            label={props.planType}
                        />
                        <div
                            className={`--typography-labels-label-lg-alt ${style.headerSubtitle}`}
                        >
                            {props.label}
                        </div>
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
