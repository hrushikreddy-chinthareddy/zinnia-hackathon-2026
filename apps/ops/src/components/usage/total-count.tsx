import {
    UserActivityOutput,
    UserViewsOutput,
} from '@xd/api-types/dist/generated-types/analytics';

import Typography, { TypographyVariant } from '../typography/typography';

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
