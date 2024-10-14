import NextDocument, { DocumentContext, DocumentProps, Head, Html, Main, NextScript } from 'next/document';

import { getInitialData } from '@deps/helpers/query-data.helper';

import i18nextConfig from '../../next-i18next.config';

interface DocumentContextProps extends DocumentProps {
    company: string;
}

const Document = ({ company }: DocumentContextProps) => {
    const currentLocale = i18nextConfig.i18n.defaultLocale;

    return (
        <Html lang={currentLocale}>
            <Head>
                <link rel="stylesheet" href={`/styles/themes/${company?.toLowerCase()}/theme.css`} />
            </Head>
            <body className="bg-background">
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

    return {
        ...initialProps,
        company,
    };
};

export default Document;
