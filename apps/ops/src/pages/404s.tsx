import router from 'next/router';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import NoNavLayout from '@deps/components/no-nav-layout';
import { ReactComponent as ErrorIcon } from '@deps/styles/elements/icons/icons_outlined/exclamation-alert.svg';

const Custom404Page = () => {
    const { t } = useTranslation();
    const { title, lng, ...rest } = router.query;
    useEffect(() => {
        window.history.replaceState(window.history.state, '', '/404');
    }, []);

    return (
        <NoNavLayout displayTopNavBar={true}>
            <div className="flex h-[500px] w-full items-center justify-center rounded border-2 border-dashed border-semantic-warning bg-white shadow-sm">
                <CardInfo
                    icon={<ErrorIcon className="text-semantic-warning" height={50} width={50} />}
                    title={title ? t(`site.${title?.toString()}.title`) : t('site.pageNotFound.title')}
                    subtitle={title ? t(`site.${title?.toString()}.message`, rest) : t('site.pageNotFound.message')}
                />
            </div>
        </NoNavLayout>
    );
};

export default Custom404Page;
