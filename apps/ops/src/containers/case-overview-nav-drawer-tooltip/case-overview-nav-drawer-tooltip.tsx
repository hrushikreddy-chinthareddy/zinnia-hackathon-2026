import { useTranslation } from 'next-i18next';

import ChipStatus from '@deps/components/chip-status/chip-status';
import { Statuses } from '@deps/models/case/case';

export const CaseOverviewNavDrawerTitle = () => {
    const { t } = useTranslation();

    return <p className={'font-primary text-base font-semibold text-white'}>{t('caseOverview.navDrawer.tooltip.title')}</p>;
};

export default function CaseOverviewNavDrawerTooltip() {
    const { t } = useTranslation();

    const bodyTextClasses = 'font-secondary font-normal text-body-sm text-white';
    const labelTextClasses = 'font-primary font-medium text-sm leading-4 text-white';

    return (
        <div className="flex w-[250px] flex-col gap-4">
            <div className="gap-1">
                <p className={`${bodyTextClasses} mb-4`}>{t('caseOverview.navDrawer.tooltip.body1')}</p>
                <p className={bodyTextClasses}>{t('caseOverview.navDrawer.tooltip.body2')}</p>
            </div>
            <div className="flex flex-col items-start gap-4">
                <div className="flex flex-row items-center gap-4">
                    <div className="w-auto">
                        <ChipStatus status={Statuses.Exception} />
                    </div>
                    <p className={labelTextClasses}>{t('caseOverview.navDrawer.tooltip.exception')}</p>
                </div>
                <div className="flex flex-row items-center gap-4">
                    <div className="w-[90px]">
                        <ChipStatus status={Statuses.InProgress} />
                    </div>
                    <p className={labelTextClasses}>{t('caseOverview.navDrawer.tooltip.inProgress')}</p>
                </div>
                <div className="flex flex-row items-center gap-4">
                    <div className="w-[90px]">
                        <ChipStatus status={Statuses.Completed} />
                    </div>
                    <p className={labelTextClasses}>{t('caseOverview.navDrawer.tooltip.completed')}</p>
                </div>
                <div className="flex flex-row items-center gap-4">
                    <div className="w-[90px]">
                        <ChipStatus status={Statuses.NotStarted} />
                    </div>
                    <p className={labelTextClasses}>{t('caseOverview.navDrawer.tooltip.notStarted')}</p>
                </div>
            </div>
        </div>
    );
}
