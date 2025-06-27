import { TFunction } from 'next-i18next';

import { Statuses } from '@deps/models/case/case';

import {
    getStatusAccentColor,
    getStatusData,
    getTimeAgoUnitValue,
} from './useStatusInfo';

jest.mock('next/image', () => {
    return () => 'Image';
});

describe('getStatusAccentColor', () => {
    it('should return the correct color for each status', () => {
        expect(getStatusAccentColor(Statuses.Exception)).toBe('semantic-error');
        expect(getStatusAccentColor(Statuses.InProgress)).toBe('semantic-info');
        expect(getStatusAccentColor(Statuses.Completed)).toBe(
            'semantic-success'
        );
        expect(getStatusAccentColor(Statuses.NotStarted)).toBe('gray-600');
        expect(getStatusAccentColor(undefined)).toBe('gray-600');
    });
});

describe('getStatusData', () => {
    const t: TFunction = (str: any) => str;
    const reason = 'test reason';
    const detailedReason = 'test detailed reason';

    it('should return the correct data for each status', () => {
        expect(
            getStatusData(t, Statuses.Exception, reason, detailedReason)
        ).toHaveProperty('accentColor', 'semantic-error');
        expect(
            getStatusData(t, Statuses.InProgress, reason, detailedReason)
        ).toHaveProperty('accentColor', 'semantic-info');
        expect(
            getStatusData(t, Statuses.Completed, reason, detailedReason)
        ).toHaveProperty('accentColor', 'semantic-success');
        expect(
            getStatusData(t, Statuses.NotStarted, reason, detailedReason)
        ).toHaveProperty('accentColor', 'gray-600');
        expect(
            getStatusData(t, undefined, reason, detailedReason)
        ).toHaveProperty('accentColor', 'gray-600');
    });
});

describe('getTimeAgoUnitValue', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-05-01T03:59:53.244Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('uses months when appropriate', () => {
        const { unit, count } = getTimeAgoUnitValue(
            '2024-01-10T03:59:53.244Z'
        ) as { unit: string; count: number };
        expect(unit).toEqual('month');
        expect(count).toEqual(3);
    });

    it('uses weeks when appropriate', () => {
        const { unit, count } = getTimeAgoUnitValue(
            '2024-04-10T03:59:53.244Z'
        ) as { unit: string; count: number };
        expect(unit).toEqual('week');
        expect(count).toEqual(3);
    });

    it('uses days when appropriate', () => {
        const { unit, count } = getTimeAgoUnitValue(
            '2024-04-29T03:59:53.244Z'
        ) as { unit: string; count: number };
        expect(unit).toEqual('day');
        expect(count).toEqual(2);
    });

    it('uses hours when appropriate', () => {
        const { unit, count } = getTimeAgoUnitValue(
            '2024-04-30T22:32:53.244Z'
        ) as { unit: string; count: number };
        expect(unit).toEqual('hour');
        expect(count).toEqual(5);
    });

    it('uses minutes when appropriate', () => {
        const { unit, count } = getTimeAgoUnitValue(
            '2024-05-01T03:47:53.244Z'
        ) as { unit: string; count: number };
        expect(unit).toEqual('minute');
        expect(count).toEqual(12);
    });
});
