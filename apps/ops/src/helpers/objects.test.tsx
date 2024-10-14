import { getObjDeepValue } from './objects.helper';

describe('Objects Helper', () => {
    describe('> getObjDeepValue', () => {
        it('should get a value by dot notation', () => {
            const obj = {
                test: {
                    value: 'hey',
                },
            };
            const key = 'test.value';
            const value = getObjDeepValue(obj, key);

            expect(value).toBe('hey');
        });
    });
});
