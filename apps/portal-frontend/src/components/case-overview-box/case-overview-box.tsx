import { useTranslation } from 'next-i18next';
import React from 'react';

import ButtonGroup from '@deps/components/button-group/button-group';
import { getClassNames } from '@deps/components/case-overview-box/case-overview-box.helper';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { Statuses } from '@deps/models/case/case';

export interface CaseOverviewBoxProps {
    children: React.ReactNode;
    label: string;
    caseProgress?: {
        open: number;
        resolved: number;
    };
    stepProgress?: {
        currentStep: number;
        totalSteps: number;
    };
    status: Statuses;
    activeToggleBtn: string;
    setActiveToggleBtn: (value: string) => void;
}

const CaseOverViewBox: React.FC<CaseOverviewBoxProps> = ({
    caseProgress,
    children,
    label,
    stepProgress,
    status,
    activeToggleBtn,
    setActiveToggleBtn,
}) => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    return (
        <div className={`mt-1 flex w-full flex-col rounded border-t-8 bg-white p-8 shadow-elevation-04 ${getClassNames(status)}`}>
            <div className="flex w-full flex-col items-start justify-start md:flex-row md:items-center md:justify-between ">
                <Typography variant={TypographyVariant.H1}>{label}</Typography>
                {stepProgress?.currentStep !== undefined && (
                    <span className="mt-4 font-primary text-field-label font-bold text-gray-900 xl:mt-0">
                        {t('overview.stepProgress', { current: stepProgress.currentStep, totalSteps: stepProgress.totalSteps })}
                    </span>
                )}

                {caseProgress?.open !== undefined && (
                    <span className="mt-4 xl:mt-0">
                        <ButtonGroup
                            isFullWidth
                            activeValue={activeToggleBtn}
                            toggle={value => {
                                if (!value) {
                                    value = activeToggleBtn;
                                }
                                setActiveToggleBtn(value);
                            }}
                            labels={[
                                {
                                    label: t('overview.open', { count: caseProgress.open }),
                                    value: 'open',
                                },
                                {
                                    disabled: caseProgress.resolved === 0,
                                    label: t('overview.resolved', { count: caseProgress.resolved }),
                                    value: 'resolved',
                                },
                            ]}
                            size={'xxs'}
                            variant={'primary'}
                            groupLabel={t('overview.toggleResolvedVsOpend')}
                            hideLabel={true}
                        />
                    </span>
                )}
            </div>
            <div className="flex w-full py-8">{children}</div>
        </div>
    );
};

export default CaseOverViewBox;
