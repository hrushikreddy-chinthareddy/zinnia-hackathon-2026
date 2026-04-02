import fs from 'fs';
import { marked, Renderer } from 'marked';
import Head from 'next/head';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import path from 'path';

import { TranslationFiles } from '@deps/config/translations';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import nextI18nextConfig from 'next-i18next.config';

import type { GetServerSideProps } from 'next';

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/<[^>]*>/g, '')
        .replace(/&[^;]+;/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

const DOCS_PATH = path.join(process.cwd(), 'docs', 'transaction-builder.md');

interface Props {
    html: string;
}

export default function TransactionBuilderDocs({ html }: Props) {
    return (
        <>
            <Head>
                <title>Transaction Builder Docs — Zinnia Ops</title>
                <style>{`html { scroll-behavior: smooth; }`}</style>
            </Head>

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-100">
                    <div className="max-w-5xl mx-auto px-8 py-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/transaction-builder"
                                className="text-sm text-gray-400 hover:text-indigo-600 transition-colors"
                            >
                                ← Transaction Builder
                            </Link>
                            <span className="text-gray-200">/</span>
                            <span className="text-sm font-medium text-gray-700">
                                Documentation
                            </span>
                        </div>
                        <Link
                            href="/transaction-builder"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                        >
                            Open Builder
                            <span aria-hidden>→</span>
                        </Link>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-5xl mx-auto px-8 py-10">
                    <article
                        className="prose prose-gray prose-sm md:prose-base max-w-none
                            prose-headings:font-semibold prose-headings:tracking-tight
                            prose-h1:text-2xl prose-h1:text-gray-900 prose-h1:mb-2
                            prose-h2:text-lg prose-h2:text-gray-800 prose-h2:mt-10 prose-h2:mb-3 prose-h2:border-b prose-h2:border-gray-100 prose-h2:pb-2
                            prose-h3:text-base prose-h3:text-gray-700 prose-h3:mt-6 prose-h3:mb-2
                            prose-h4:text-sm prose-h4:text-gray-600 prose-h4:mt-4 prose-h4:mb-1
                            prose-p:text-gray-600 prose-p:leading-relaxed
                            prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
                            prose-code:text-indigo-700 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:text-xs
                            prose-table:text-sm prose-table:border-collapse
                            prose-th:bg-gray-50 prose-th:text-gray-700 prose-th:font-semibold prose-th:px-4 prose-th:py-2.5 prose-th:border prose-th:border-gray-200 prose-th:text-left
                            prose-td:px-4 prose-td:py-2 prose-td:border prose-td:border-gray-100 prose-td:text-gray-600
                            prose-li:text-gray-600
                            prose-blockquote:border-l-indigo-400 prose-blockquote:bg-indigo-50/50 prose-blockquote:py-1 prose-blockquote:text-indigo-800 prose-blockquote:not-italic
                            prose-strong:text-gray-800
                            bg-white rounded-2xl border border-gray-100 shadow-sm px-10 py-10"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                </div>
            </div>
        </>
    );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
    locale = DEFAULT_LOCALE,
}) => {
    const translations = await serverSideTranslations(
        locale,
        [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
        nextI18nextConfig,
        ALL_LOCALES
    );

    const markdown = fs.readFileSync(DOCS_PATH, 'utf-8');

    const renderer = new Renderer();
    renderer.heading = function ({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const id = slugify(text);
        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
    };

    const html = await marked(markdown, { renderer });

    return { props: { ...translations, html } };
};
