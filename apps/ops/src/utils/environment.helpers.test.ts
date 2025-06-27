import { ENVIRONMENT_NAME, environmentUrls } from './environment.helpers';

describe('Environment Helper', () => {
    const OLD_ENV = process.env;
    describe('isNonProductionEnvironment', () => {
        beforeEach(() => {
            jest.resetModules();
            process.env = { ...OLD_ENV };
        });
        afterEach(() => {
            process.env = OLD_ENV;
        });
        it('Should return false if the api environment is prod', () => {
            process.env.NEXT_PUBLIC_BACKEND_URL =
                environmentUrls[ENVIRONMENT_NAME.PROD];
            // eslint-disable-next-line
            const {
                isNonProductionEnvironment,
            } = require('./environment.helpers');

            expect(isNonProductionEnvironment()).toBe(false);
        });

        it('Should return true if the api environment is QA', () => {
            process.env.NEXT_PUBLIC_BACKEND_URL =
                environmentUrls[ENVIRONMENT_NAME.QA];
            // eslint-disable-next-line
            const {
                isNonProductionEnvironment,
            } = require('./environment.helpers');

            expect(isNonProductionEnvironment()).toBe(true);
        });

        it('Should return true if the api environment is dev', () => {
            process.env.NEXT_PUBLIC_BACKEND_URL =
                environmentUrls[ENVIRONMENT_NAME.DEV];
            // eslint-disable-next-line
            const {
                isNonProductionEnvironment,
            } = require('./environment.helpers');

            expect(isNonProductionEnvironment()).toBe(true);
        });
    });

    describe('env helpers', () => {
        beforeEach(() => {
            jest.resetModules();
            process.env = { ...OLD_ENV };
        });
        afterEach(() => {
            process.env = OLD_ENV;
        });

        Object.entries(environmentUrls).forEach(([environment, url]) => {
            it(`Should return true if the api environment is ${environment} and false otherwise`, () => {
                process.env.NEXT_PUBLIC_BACKEND_URL = url;
                // eslint-disable-next-line
                const {
                    isQA,
                    isProd,
                    isUat,
                    isDev,
                } = require('./environment.helpers');

                switch (environment) {
                    case ENVIRONMENT_NAME.PROD:
                        expect(isProd()).toBe(true);
                        expect(isQA()).toBe(false);
                        expect(isUat()).toBe(false);
                        expect(isDev()).toBe(false);
                        break;
                    case ENVIRONMENT_NAME.QA:
                        expect(isProd()).toBe(false);
                        expect(isQA()).toBe(true);
                        expect(isUat()).toBe(false);
                        expect(isDev()).toBe(false);
                        break;
                    case ENVIRONMENT_NAME.UAT:
                        expect(isProd()).toBe(false);
                        expect(isQA()).toBe(false);
                        expect(isUat()).toBe(true);
                        expect(isDev()).toBe(false);
                        break;
                    case ENVIRONMENT_NAME.DEV:
                        expect(isProd()).toBe(false);
                        expect(isQA()).toBe(false);
                        expect(isUat()).toBe(false);
                        expect(isDev()).toBe(true);
                        break;
                    default:
                        break;
                }
            });
        });
    });
});
