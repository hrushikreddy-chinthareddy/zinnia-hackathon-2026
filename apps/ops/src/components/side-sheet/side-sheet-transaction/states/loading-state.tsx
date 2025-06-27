import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';

const LoadingState = () => {
    return (
        <div className="p-8">
            <PageLoader variant={PageLoaderVariant.Center} />
        </div>
    );
};

export default LoadingState;
