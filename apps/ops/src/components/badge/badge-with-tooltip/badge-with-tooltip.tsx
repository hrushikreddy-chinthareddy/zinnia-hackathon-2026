import Tooltip, { PopoverPlacement } from '@deps/components/tooltip/tooltip';

import Badge, { BadgeProps } from '../badge';

export interface BadgeWithTooltipProps extends BadgeProps {
    tooltip: string;
    tooltipPlacement?: PopoverPlacement;
}

const BadgeWithTooltip = ({
    className,
    icon,
    label,
    rounded = true,
    tooltip,
    tooltipPlacement = PopoverPlacement.TopRight,
    variant,
}: BadgeWithTooltipProps) => {
    return (
        <div className={className}>
            <Tooltip body={tooltip} placement={tooltipPlacement}>
                <Badge
                    icon={icon}
                    label={label}
                    rounded={rounded}
                    variant={variant}
                />
            </Tooltip>
        </div>
    );
};

export default BadgeWithTooltip;
