import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import {
    UserActivityOutput,
    UserViewsOutput,
} from '@zinnia/api-types/types/analytics';

type TotalCountProps = {
    isDataFetching: boolean;
    data: UserActivityOutput | UserViewsOutput;
};

export const TotalCount = ({ isDataFetching, data }: TotalCountProps) => {
    return (
        <div
            className={`flex items-center h-full mt-5 ${
                isDataFetching ? 'blur' : ''
            }`}
        >
            <Typography variant={TypographyVariant.BodySm}>
                {data?.totalElements?.toLocaleString() || '0'} total
            </Typography>
        </div>
    );
};
