import Script from 'next/script';

const GaMouseflowTrackingScript = () => {
    let mouseflowurl = "//cdn.mouseflow.com/projects/100abfc3-26a9-4338-a053-c6d3561938f3.js";

    if (process.env.NEXT_PUBLIC_GOOGLEANALYTICS_ENV === 'production'){
        mouseflowurl = "//cdn.mouseflow.com/projects/c75f7bc2-4a0f-4b04-aa9e-d235631ac76c.js";
    }

    return (
        <Script id="zmouseflowtracking" type="text/javascript">
            {`
                window._mfq = window._mfq || [];
                (function() {
                    var mf = document.createElement("script");
                    mf.type = "text/javascript"; mf.defer = true;
                    mf.src = "${mouseflowurl}";
                    document.getElementsByTagName("head")[0].appendChild(mf);
                })();
            `}
        </Script>
    );
};

export default GaMouseflowTrackingScript;