describe('Environment Helper', () => {
    describe('isNonProductionEnvironment', () => {
        const OLD_ENV = process.env;
        beforeEach(() => {
            jest.resetModules();
            process.env = { ...OLD_ENV };
        });
        afterAll(() => {
            process.env = OLD_ENV;
        });
        it('Should return false if the api environment is prod-like', () => {
            process.env.NEXT_PUBLIC_BACKEND_URL = 'https://api.zinnia.io';
            // eslint-disable-next-line
            const { isNonProductionEnvironment } = require('./environment.helper');

            expect(isNonProductionEnvironment()).toBe(false);
        });

        it('Should return true if the api environment is qa-like', () => {
            const mockQaLikeEnv = 'qa.api.example.com';

            process.env.NEXT_PUBLIC_BACKEND_URL = mockQaLikeEnv;
            // eslint-disable-next-line
            const { isNonProductionEnvironment } = require('./environment.helper');

            expect(isNonProductionEnvironment()).toBe(true);
        });

        it('Should return true if the api environment is dev-like', () => {
            const mockDevLikeEnv = 'dev.api.example.com';

            process.env.NEXT_PUBLIC_BACKEND_URL = mockDevLikeEnv;
            // eslint-disable-next-line
            const { isNonProductionEnvironment } = require('./environment.helper');

            expect(isNonProductionEnvironment()).toBe(true);
        });
    });
});

export { };
