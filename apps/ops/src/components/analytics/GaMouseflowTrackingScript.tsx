import Script from 'next/script';

import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { NODE_ENV_PRODUCTION } from '@deps/types/constants';

const GaMouseflowTrackingScript = () => {
    const { bulkCheckComplete, isAdvisorsExcel } = usePermissionsContext();

    if (!bulkCheckComplete) {
        return;
    }

    // TODO MG: why is this throwing an error? saying its not in turbo
    // it would be ideal to have an env variable for the siteId rather than the ENV
    const mouseflowSiteId = process.env.NEXT_PUBLIC_GOOGLEANALYTICS_ENV === NODE_ENV_PRODUCTION ? 'c75f7bc2-4a0f-4b04-aa9e-d235631ac76c' : '100abfc3-26a9-4338-a053-c6d3561938f3';
    const mouseflowUrl = `//cdn.mouseflow.com/projects/${mouseflowSiteId}.js`;

    return (
        <Script id="zmouseflowtracking" type="text/javascript">
            {`
                window._mfq = window._mfq || [];

                window._mfq.push(['setVariable', 'isAdvisorsExcel', ${isAdvisorsExcel}]);

                (function() {
                    var mf = document.createElement("script");
                    mf.type = "text/javascript"; mf.defer = true;
                    mf.src = "${mouseflowUrl}";
                    mf.setAttribute("data-cfasync", "false");
                    mf.setAttribute("data-mouseflow-site-id", "${mouseflowSiteId}");
                    document.getElementsByTagName("head")[0].appendChild(mf);
                })();
            `}
        </Script>
    );
};

export default GaMouseflowTrackingScript;
