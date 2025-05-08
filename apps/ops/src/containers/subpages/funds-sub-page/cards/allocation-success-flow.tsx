import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useState } from 'react';

import Button, { ButtonSize, ButtonType } from '@deps/components/button/button';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { SideSheetContextProps } from '@deps/contexts/SideSheetContext';
import { ReactComponent as CircleCheckMark } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';

import { FundViewModel } from '../types';
import { EditAllocationsSummary } from './edit-allocations-summary';

interface IAllocationSuccessFlow {
    allFunds: FundViewModel[];
    total: number;
    sideSheet: SideSheetContextProps;
    submitHandler: (location: string) => Promise<void>;
    setIsSuccessFlow: Dispatch<SetStateAction<boolean>>
}

export const AllocationSuccessFlow: React.FC<IAllocationSuccessFlow> = ({ allFunds, total, submitHandler, sideSheet, setIsSuccessFlow }) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col p-8 h-full">

            <div className="flex flex-col items-center pb-10">
                <CircleCheckMark width={50} height={50} color="#007B5A" />
            </div>

            <EditAllocationsSummary funds={allFunds} total={total} editLink={
                <Typography variant={TypographyVariant.BodySm} onClick={() => {
                    setIsSuccessFlow(false)
                }}>{t('fundAllocation.editAllocationsTitle')}</Typography>
            } />

            <div className="flex items-baseline">
                <div className="pt-10 pr-8 min-w-[100px]">
                    <Button
                        className="mx-auto"
                        onClick={() => submitHandler('nigo')}
                        size={ButtonSize.Small}
                        type={ButtonType.Primary}
                    >
                        {t('fundAllocation.submit')}
                    </Button>
                </div>

                <NavElement
                    className="pt-4"
                    aria-label={t('formControls.cancel') as string}
                    onClick={() => { sideSheet?.handleOpen(false) }}
                    size={NavElementSize.Small}
                    type={NavElementType.Button}
                    variant={NavElementVariant.Default}
                >
                    {t('fundAllocation.cancel')}
                </NavElement>
            </div>
        </div>
    )
}