import { PropsWithChildren } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import { useIsClient } from '@deps/hooks/useIsClient';
import { useWindowResize } from '@deps/hooks/useWindowResize';
import { ReactComponent as ErrorIcon } from '@deps/styles/elements/icons/icons_outlined/exclamation-alert.svg';
import fullConfig from '@deps/utils/styles';

const BREAKPOINT = fullConfig.theme.screens.md;
const breakpointNumber = Number(BREAKPOINT.replace('px', ''));
export const DashboardResponsiveLayout = ({ children }: PropsWithChildren) => {
    const windowWidth = useWindowResize();
    const isClient = useIsClient();

    if (!isClient || windowWidth > breakpointNumber) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 z-50 grid h-full w-full place-items-center ">
            <CardInfo
                icon={<ErrorIcon className="text-semantic-warning" height={50} width={50} />}
                className="rounded border-2 border-dashed border-semantic-warning bg-white shadow-sm p-8 m-8 min-h-[300px] flex flex-col  gap-8"
                title="Screen width not supported"
                subtitle="We are sorry, but the current screen width is not supported. Please open on a larger screen"
            />
        </div>
    );
};
