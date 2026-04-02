import Head from 'next/head';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';

import PdfInferencePanel from '@deps/components/transaction-builder/PdfInferencePanel';
import { TranslationFiles } from '@deps/config/translations';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import nextI18nextConfig from 'next-i18next.config';

import type { GetServerSideProps } from 'next';

export default function PaperFormsToDigitalPage() {
    return (
        <>
            <Head>
                <title>Paper forms to Digital — Zinnia Ops</title>
            </Head>
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-50">
                <div className="border-b border-gray-100 bg-white/90 backdrop-blur">
                    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                                Transaction tools
                            </p>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
                                Paper forms to Digital transactions UI
                            </h1>
                            <p className="mt-2 max-w-xl text-sm text-gray-600">
                                Turn a paper PDF into an inferred tab layout and
                                RJSF schemas, then open a mock TaskContainer to
                                validate the flow.
                            </p>
                        </div>
                        <Link
                            href="/transaction-builder"
                            className="shrink-0 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                            ← Back to Form Builder
                        </Link>
                    </div>
                </div>
                <div className="mx-auto max-w-4xl px-6 py-8">
                    <PdfInferencePanel omitHeading />
                </div>
            </div>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async ({
    locale = DEFAULT_LOCALE,
}) => {
    const translations = await serverSideTranslations(
        locale,
        [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
        nextI18nextConfig,
        ALL_LOCALES
    );
    return { props: { ...translations } };
};
