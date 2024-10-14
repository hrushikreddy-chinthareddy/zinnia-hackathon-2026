import { setCookie } from 'cookies-next';
import { IncomingMessage, ServerResponse } from 'http';
import { NextRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import { RefObject } from 'react';

import { toSentenceCase } from './string.helper';
import nextI18nextConfig from '../../next-i18next.config';

interface LocalePrefix {
    locale?: string;
    prefix?: string;
    suffix?: string;
}

export const DEFAULT_LOCALE = nextI18nextConfig.i18n.defaultLocale;
export const ALL_LOCALES = nextI18nextConfig.i18n.locales;

export const lPrefix = ({ prefix = '', locale = DEFAULT_LOCALE, suffix = '' }: LocalePrefix) =>
    locale && (locale === DEFAULT_LOCALE || locale === 'en') ? '' : `${prefix}${locale}${suffix}`;

export const setNextLocaleCookie = (locale: string, req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
    setCookie('NEXT_LOCALE', locale, { req, res, maxAge: 60 * 60 * 24, path: '/' });
};

type RouteParams = {
    [key: string]: string | number;
};

type GoToOptions = {
    replace?: boolean;
};

export const goTo = (path: string, router: NextRouter, params?: RouteParams, options?: GoToOptions): void => {
    const { replace = false } = options || {};

    let formattedPath = path;

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            formattedPath = formattedPath.replace(`[${key}]`, value.toString());
        });
    }

    if (replace) {
        router.replace(formattedPath);
    } else {
        router.push(formattedPath);
    }
};

export const convertToQueryString = (params: { [key: string]: string | number | boolean }): string => {
    const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');

    return '?' + queryString;
};

/**
 * Regular expression to check if a URL is a People Detail page.
 * It matches URLs that end with '/people/' followed by a 24-character hexadecimal string.
 * @type {RegExp}
 */
const isPeopleDetailPage = /\/people\/[^/]+$/;

/**
 * An array of regular expressions that define exceptions for sentence casing.
 * If a URL matches any of these patterns, it won't be converted to sentence case.
 * @type {RegExp[]}
 */
const sentenceCaseExceptions: RegExp[] = [isPeopleDetailPage];

/**
 * Returns the breadcrumb text for the given `h1Tag` and `url`.
 * The text will be in sentence case unless the URL matches one of the exceptions.
 *
 * @param {TFunction} t - Translation function.
 * @param {string} h1Tag - The main heading tag.
 * @param {string} url - The current URL.
 * @returns {string} The breadcrumb text.
 * @export
 */
export const getBreadcrumbText = (t: TFunction, h1Tag: string, url: string): string => {
    const breadcrumbPath = t('breadcrumb', { path: h1Tag });

    return sentenceCaseExceptions.some(regex => regex.test(url)) ? breadcrumbPath : toSentenceCase(breadcrumbPath);
};

export const scrollToElement = <T extends HTMLDivElement>(containerRef: RefObject<T>, activeElementIndex: number, scrollAmount = 0) => {
    if (containerRef.current && activeElementIndex > -1) {
        const containerLeft = containerRef.current.getBoundingClientRect().left;
        const element = containerRef.current.children[0].children[activeElementIndex];

        if (element) {
            if (scrollAmount > 0) {
                containerRef.current.scrollLeft += scrollAmount;
            } else {
                const elementLeft = element.getBoundingClientRect().left;
                const scrollPosition = elementLeft - containerLeft;

                containerRef.current.scrollLeft += scrollPosition;
            }
        }
    }
};
