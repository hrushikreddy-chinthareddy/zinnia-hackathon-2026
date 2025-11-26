import { CarrierName } from '@zinnia/bloom/components';
import NextDocument, {
    DocumentContext,
    DocumentProps,
    Head,
    Html,
    Main,
    NextScript,
} from 'next/document';
import Script from 'next/script';
import { parseCookies } from 'nookies';

import { PendoAnalyticsScript as PendoAnalyticsSnippet } from '@deps/components/analytics/PendoAnalyticsSnippet';
import { getInitialData } from '@deps/helpers/query-data.helpers';

import i18nextConfig from '../../next-i18next.config';

interface DocumentContextProps extends DocumentProps {
    company: string;
    theme: CarrierName;
}

const Document = ({ company, theme }: DocumentContextProps) => {
    const currentLocale = i18nextConfig.i18n.defaultLocale;

    return (
        <Html lang={currentLocale} data-theme={theme}>
            <Head>
                <link
                    rel="stylesheet"
                    href={`/styles/themes/${company?.toLowerCase()}/theme.css`}
                />
                <Script id="pendo-snippet" strategy="beforeInteractive">
                    {PendoAnalyticsSnippet}
                </Script>
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
};

Document.getInitialProps = async (ctx: DocumentContext) => {
    const initialProps = await NextDocument.getInitialProps(ctx);

    // 403 and 404 pages don't have a request object, as they are static.
    if (!ctx.req) {
        return { ...initialProps };
    }

    const { company } = await getInitialData(ctx);
    const cookies = parseCookies(ctx);
    const role = cookies.role as string | undefined;
    const theme: CarrierName =
        role === 'farmers' ? CarrierName.FARMERS : CarrierName.ZINNIA;

    return {
        ...initialProps,
        company,
        theme,
    };
};

export default Document;
