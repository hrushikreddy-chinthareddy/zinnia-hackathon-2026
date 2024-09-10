import PageLoader, { PageLoaderVariant } from '../page-loader/page-loader';
import Typography, { TypographyVariant } from '../typography/typography';

export default function EventsLoader({ message }: { message: string }) {
    return (
        <div className="h-full w-full py-4 pr-4 text-center md:pr-6 lg:pr-8">
            <PageLoader variant={PageLoaderVariant.Center} />
            <Typography variant={TypographyVariant.Label}>{message}</Typography>
        </div>
    );
}
