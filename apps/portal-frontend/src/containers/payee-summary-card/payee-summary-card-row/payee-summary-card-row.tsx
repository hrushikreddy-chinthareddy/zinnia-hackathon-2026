import clsx from 'clsx';

import Content, { ContentVariant } from '@deps/components/content/content';
import DotContainer from '@deps/components/dot-container/dot-container';
import FieldLabel from '@deps/components/fields/field-label';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

export interface PayeeSummaryCardRowProps {
    amount?: string;
    isSumTotalRow?: boolean;
    label: string;
    percentage?: string;
    popoverBody?: string;
    popoverTitle?: string;
}

const PayeeSummaryCardRow = ({ amount, isSumTotalRow = false, label, percentage, popoverBody, popoverTitle }: PayeeSummaryCardRowProps) => {
    const dotLeftContainerClasses = clsx('flex items-end');

    const dotContainerClasses = clsx({
        'mb-4': !isSumTotalRow,
    });

    const dotRightContainerClasses = clsx({
        'gap-4': !isSumTotalRow,
    });

    const dotLeftSide = (
        <div className={dotLeftContainerClasses}>
            <FieldLabel
                label={label}
                labelTooltip={popoverTitle}
                labelTooltipBody={popoverBody}
                popoverClassName="font-secondary text-md font-normal leading-[22px]"
                classNames="!gap-1"
            />
        </div>
    );

    const dotRightSide = (
        <>
            <div>
                <Content details={amount ?? DEFAULT_ERROR_STRING} variant={isSumTotalRow ? ContentVariant.Value : ContentVariant.Body} />
            </div>
            {percentage && (
                <div className="min-w-[50px] text-right">
                    <Content details={percentage} variant={ContentVariant.Body} />
                </div>
            )}
        </>
    );

    return (
        <DotContainer
            dotContainerClassName={dotContainerClasses}
            dotLeftSide={dotLeftSide}
            dotRightSide={dotRightSide}
            dotRightSideClassName={dotRightContainerClasses}
        />
    );
};

export default PayeeSummaryCardRow;
