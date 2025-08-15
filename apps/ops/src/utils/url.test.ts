import { toLowerCaseSearchParams } from './url';

describe('toCaseInsensitiveSearchParams', () => {
    it('Returns searchParams names as lowercase', () => {
        const params = new URLSearchParams([
            ['Test', 'Test1'],
            ['TEST', 'Test2'],
            ['tested', 'Test3'],
        ]);

        const newParams = toLowerCaseSearchParams(params);

        expect(newParams.size).toEqual(params.size);
        expect(Array.from(newParams)).toEqual([
            ['test', 'Test1'],
            ['test', 'Test2'],
            ['tested', 'Test3'],
        ]);
    });
});
