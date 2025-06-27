import clsx from 'clsx';

import Content, { ContentVariant } from '@deps/components/content/content';
import Popover, { PopoverPlacement } from '@deps/components/popover/popover';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { ProgressBarTest } from '@deps/jest/constants/test-id-constants';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

import Label, { LabelVariant } from '../label/label';

interface ProgressBarProps {
    compareValue: number;
    total: number;
    label: string;
    labelPopover?: string;
}

const ONE_HUNDRED = 100;

const calculatePercentage = (compareValue: number, total: number): number => {
    const ratio = compareValue / total;

    if (ratio < 1) {
        return Math.floor(ratio * ONE_HUNDRED);
    }

    return ONE_HUNDRED;
};

const ProgressBar = ({
    compareValue,
    total,
    label,
    labelPopover,
}: ProgressBarProps) => {
    const percentage = calculatePercentage(compareValue, total);
    const classes = clsx(
        'h-full rounded-l rounded-r',
        compareValue > total ? 'bg-semantic-error' : 'bg-semantic-success'
    );
    const formattedCompareValue = numberFormatify(compareValue);
    const formattedTotal = numberFormatify(total);

    return (
        <div>
            <div
                className="h-2 w-full rounded bg-gray-200"
                data-testid={ProgressBarTest.PROGRESSBAR}
            >
                <div
                    className={classes}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>

            <div className="mt-4 flex justify-between">
                <Content
                    variant={ContentVariant.Value}
                    details={formattedCompareValue}
                    data-testid={ProgressBarTest.COMPAREVALUE}
                />
                <div className="flex justify-end">
                    <Label
                        variant={LabelVariant.LabelMd}
                        label={formattedTotal}
                        className="text-right"
                        data-testid={ProgressBarTest.TOTAL}
                    />
                </div>
            </div>
            <div
                className="flex items-center justify-end"
                data-testid={ProgressBarTest.LABEL}
            >
                <Content
                    variant={ContentVariant.Caption}
                    details={label}
                    popoverBody={labelPopover}
                    contentClassName="flex mr-1"
                />
                {label && labelPopover && (
                    <Popover
                        placement={PopoverPlacement.BottomLeft}
                        body={labelPopover}
                        title={label}
                    >
                        <CircleInfoIcon
                            height={'13px'}
                            width={'13px'}
                            className="text-primary"
                        />
                    </Popover>
                )}
            </div>
        </div>
    );
};

export default ProgressBar;
