import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { PropsWithChildren, useState } from 'react';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';

const ErrorBoundary = ({ children }: PropsWithChildren) => {
    const [hasError, setHasError] = useState(false);
    const { i18n } = useTranslation(TranslationFiles.COMMON);
    const { language } = i18n;
    const router = useRouter();

    const goTo = (url: string) => {
        router.push(url, undefined, { locale: language }).then(() => {
            router.reload();
        });
    };

    return hasError ? (
        <div>
            <Typography variant={TypographyVariant.H2}>Oops, there is an error!</Typography>
            <button
                type="button"
                onClick={() => {
                    setHasError(false);
                    goTo('/');
                }}
            >
                Try again?
            </button>
        </div>
    ) : (
        <>{children}</>
    );
};

export default ErrorBoundary;
