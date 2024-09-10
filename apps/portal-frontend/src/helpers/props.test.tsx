import { mergeClasses } from './props.helper';

describe('Props Helper', () => {
    describe('> mergeClasses', () => {
        it('should add a new class to the end of a string', () => {
            const classes = 'test test2';
            const newClasses = 'test3';
            const mergedClasses = mergeClasses(classes, newClasses);

            expect(mergedClasses).toBe(classes + ' ' + newClasses);
        });
    });
});
