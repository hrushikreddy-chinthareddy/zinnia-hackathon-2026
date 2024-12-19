import { PropsWithChildren } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
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
        <div className="flex flex-col items-center justify-start h-full w-full">
            <Typography className="text-center m-4" variant={TypographyVariant.H1}>
                Carrier Dashboard
            </Typography>
            <CardInfo
                icon={<ErrorIcon className="text-semantic-warning" height={50} width={50} />}
                className="rounded border-2 border-dashed border-semantic-warning bg-white shadow-sm p-6 m-6 flex flex-col  gap-2"
                title="Screen width not supported"
                subtitle="We are sorry, but the current screen width is not supported. Please open on a larger screen"
            />
        </div>
    );
};
