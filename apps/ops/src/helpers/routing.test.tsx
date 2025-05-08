import { faker } from '@faker-js/faker';

import { getBreadcrumbText, lPrefix } from './routing.helpers';
import { toSentenceCase } from './string.helper';

describe('Routing Helper', () => {
    describe('> lPrefix', () => {
        it('should add a prefix to a non-en locale', () => {
            const prefix = 'test';
            const value = lPrefix({ prefix, locale: 'fr' });

            expect(value).toBe('testfr');
        });

        it('should add a suffix to a non-en locale', () => {
            const suffix = 'test';
            const value = lPrefix({ locale: 'fr', suffix });

            expect(value).toBe('frtest');
        });

        it('should equal nothing', () => {
            const prefix = 'tested';
            const suffix = 'test';
            const value = lPrefix({ prefix, suffix });

            expect(value).toBe('');
        });
    });
    describe('getBreadcrumbText', () => {
        const mockTitle = 'this is a test title';
        const titleCaseH1 = toSentenceCase(mockTitle);

        const mockTFunction = jest.fn().mockReturnValue(mockTitle);

        const getTitle = (testUrl: string) => getBreadcrumbText(mockTFunction, mockTitle, testUrl);

        describe('general behavior', () => {
            it('returns the title in sentence case for any URL', () => {
                const genericUrl = `${faker.internet.url()}/${faker.internet.domainWord()}`;
                expect(getTitle(genericUrl)).toEqual(titleCaseH1);
            });
        });

        describe('exception cases', () => {
            it('returns the title without sentence case for people detail pages', () => {
                const peoplePage = `${faker.internet.url()}/people/${faker.database.mongodbObjectId()}`;
                expect(getTitle(peoplePage)).toEqual(mockTitle);
            });
        });
    });
});
