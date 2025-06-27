import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';

export const Loading = () => {
    return (
        <div className="fixed left-0 top-0 z-10 flex h-screen w-screen justify-center bg-gray-800 opacity-80">
            <PageLoader variant={PageLoaderVariant.Center} />
        </div>
    );
};
