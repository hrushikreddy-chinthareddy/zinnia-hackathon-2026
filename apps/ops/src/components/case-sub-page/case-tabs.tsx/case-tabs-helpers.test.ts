import { TFunction } from 'next-i18next';

import { mockCaseDetails } from '@deps/services/mocks/case-details';

import { mapCaseDetails, completionPercentageString, formatTimestamp } from './case-tabs-helpers';
const mockT = (key: string, values?: Record<string, string>) => {
    if (values) {
        return `${key} ${Object.values(values).join(', ')}`;
    }
    return key;
};

const t = mockT as TFunction;
describe('case-tabs-helpers', () => {
    describe('mapCaseDetails', () => {
        it('should return an object with the correct properties', () => {
            const result = mapCaseDetails(mockCaseDetails, t);

            // These tests are making sure that multiInstance mapping and unmapped exceptions are doing something right
            expect(result.completedSteps).toBe(18);
            expect(result.totalSteps).toBe(27);
            expect(result.stages).toHaveLength(mockCaseDetails.stages.length);
            expect(result.unmappedExceptions).toHaveLength(2);
        });

        // TODO: Test the property values in addition to checking existence
        it('should map stages correctly', () => {
            const result = mapCaseDetails(mockCaseDetails, t);
            const stages = result.stages;

            stages.forEach((stage, index) => {
                expect(stage).toHaveProperty('completedSteps');
                expect(stage).toHaveProperty('id', mockCaseDetails.stages[index].id);
                expect(stage).toHaveProperty('name');
                expect(stage).toHaveProperty('nigoSteps');
                expect(stage).toHaveProperty('status');
                expect(stage).toHaveProperty('steps');
                expect(stage).toHaveProperty('totalSteps');
                expect(stage).toHaveProperty('updatedAt');
            });
        });
    });

    describe('completionPercentageString', () => {
        it('should return a string with the correct percentage', () => {
            const result = completionPercentageString(3, 7, t);
            const expectedPercentage = ((3 / 7) * 100).toFixed(0);

            expect(result).toBe(`caseOverview.tabs.percentComplete ${expectedPercentage}%`);
        });
    });

    // TODO: Mock a whole bunch of dayjs methods to get timezone working
    describe('formatTimestamp', () => {
        // TODO MG: unskip when we revert vijyas change
        it.skip('should format timestamp correctly', () => {
            const timestamp = '2024-05-13T13:00:00.000Z';
            const result = formatTimestamp(timestamp);

            // stop-gap until the todo is completed.  Make sure the timestamp starts with the right date and ends in ':09[am|pm] [TZ3]'
            expect(result).toMatch('5/13/2024 at');
            expect(result).toMatch(new RegExp(':\\d{2}[a-z]{2} [A-Z]{3}[+-]\\d{1,2}:\\d{2}'));
        });
    });
});
