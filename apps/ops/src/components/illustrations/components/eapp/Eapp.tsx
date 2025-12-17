// import { Typography, Icon, IconType } from '@zinnia/bloom/components';
import { ReactElement } from 'react';

import style from './eapp.module.css';
import { Menu } from './menu/menu';
import { SectionView } from './section-view/SectionView';
import { Sidebar } from './sidebar/sidebar';
import { useActiveSection } from '../../providers/ActiveSectionProvider';

export interface EappProps {
    label: string;
    planCode: string;
    isEdit?: boolean;
    illustrationId?: string;
}
export function Eapp(props: EappProps): ReactElement | null {
    const { activeSection } = useActiveSection();

    if (!activeSection) {
        return null;
    }

    return (
        <div className={style.eApp}>
            <div className={style.headerWrapper}>
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
                        <Sidebar
                            isEdit={props.isEdit}
                            illustrationId={props.illustrationId}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
