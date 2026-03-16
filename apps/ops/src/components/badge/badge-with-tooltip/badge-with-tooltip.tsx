import Tooltip, { PopoverPlacement } from '@deps/components/tooltip/tooltip';

import Badge, { BadgeProps } from '../badge';

export interface BadgeWithTooltipProps extends BadgeProps {
    tooltip: string;
    tooltipPlacement?: PopoverPlacement;
    testId?: string;
}

const BadgeWithTooltip = ({
    className,
    icon,
    label,
    rounded = true,
    tooltip,
    tooltipPlacement = PopoverPlacement.TopRight,
    variant,
    testId,
}: BadgeWithTooltipProps) => {
    return (
        <div className={className}>
            <Tooltip
                body={tooltip}
                placement={tooltipPlacement}
                triggerAriaLabel={label}
            >
                <Badge
                    icon={icon}
                    label={label}
                    rounded={rounded}
                    variant={variant}
                    testId={testId}
                />
            </Tooltip>
        </div>
    );
};

export default BadgeWithTooltip;
