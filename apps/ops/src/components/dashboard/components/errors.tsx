import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';

export const ErrorMessage = ({
    className = 'grid grid-cols-[min-content_max-content] gap-2 items-center place-content-center h-full w-full min-h-[400px]',
}: {
    className?: string;
}) => {
    return (
        <div className={className}>
            <ChartBarsIcon height={'24px'} width={'24px'} />
            <Typography
                variant={TypographyVariant.BodyBold}
                className="flex flex-row gap-2"
            >
                Data not available. Refresh the page to try again.
            </Typography>
        </div>
    );
};

export const NoDataMessage = ({
    className = 'grid grid-cols-[min-content_max-content] gap-2 items-center place-content-center h-full w-full min-h-[400px]',
}: {
    className?: string;
}) => {
    return (
        <div className={className}>
            <ChartBarsIcon height={'24px'} width={'24px'} />
            <Typography
                variant={TypographyVariant.BodyBold}
                className="flex flex-row gap-2"
            >
                Data not available. Try adjusting your filters.
            </Typography>
        </div>
    );
};
