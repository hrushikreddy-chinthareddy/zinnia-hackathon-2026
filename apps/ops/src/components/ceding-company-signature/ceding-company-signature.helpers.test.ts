import { act, renderHook } from '@testing-library/react';
import { TFunction } from 'next-i18next';
import { useState } from 'react';

import { NonRegTypeReason, RegReason } from '@deps/models/case/withdrawal/case';

import {
    validButtonGroupOptions,
    yesNoButtonGroupOptions,
    invalidOwnerRegReasons,
    authorizedPersonSignPresentoptions,
    toggleOption,
    isChecked,
} from './ceding-company-signature.helpers';

const mockT: TFunction = (key: any) => key;

describe('ceding-company-signature.helpers', () => {
    test('validButtonGroupOptions should return correct options', () => {
        const options = validButtonGroupOptions(mockT);
        expect(options).toEqual([
            { label: 'yes', value: 'true' },
            { label: 'no', value: 'false' },
        ]);
    });

    test('yesNoButtonGroupOptions should return correct options', () => {
        const options = yesNoButtonGroupOptions(mockT);
        expect(options).toEqual([
            { label: 'valid', value: 'true' },
            { label: 'notValid', value: 'false' },
        ]);
    });

    test('invalidOwnerRegReasons should return correct options', () => {
        const options = invalidOwnerRegReasons(mockT);
        expect(options).toEqual([
            {
                label: 'nonRegTypeReason.jointOwnerAbsent',
                value: NonRegTypeReason.JointOwnerAbsent,
            },
            {
                label: 'nonRegTypeReason.missingInfoLoa',
                value: NonRegTypeReason.MissingInfoLoa,
            },
            {
                label: 'nonRegTypeReason.incorrectNameAnnuitant',
                value: NonRegTypeReason.IncorrectNameAnnuitant,
            },
        ]);
    });

    test('authorizedPersonSignPresentoptions should return correct options', () => {
        const options = authorizedPersonSignPresentoptions(mockT);
        expect(options).toEqual([
            { label: 'selectOption', value: 'null' },
            { label: 'yes', value: 'true' },
            { label: 'no', value: 'false' },
        ]);
    });

    test('toggleOption should correctly toggle options', () => {
        const initialReasons: RegReason<NonRegTypeReason>[] = [];
        const { result } = renderHook(() =>
            useState<RegReason<NonRegTypeReason>[]>(initialReasons)
        );
        const [_, setSelectedRegReasons] = result.current;

        const toggle = toggleOption(
            NonRegTypeReason.JointOwnerAbsent,
            setSelectedRegReasons as any
        );

        act(() => {
            toggle(true);
        });

        expect(result.current[0]).toEqual([{ text: 'JOINT_OWNER_ABSENT' }]);

        act(() => {
            toggle(false);
        });

        expect(result.current.length).toBe(2);
    });

    test('isChecked should correctly identify checked options', () => {
        const selectedRegReasons: RegReason<NonRegTypeReason>[] = [
            { text: NonRegTypeReason.JointOwnerAbsent },
        ];

        expect(
            isChecked(NonRegTypeReason.JointOwnerAbsent, selectedRegReasons)
        ).toBe(true);
        expect(
            isChecked(NonRegTypeReason.MissingInfoLoa, selectedRegReasons)
        ).toBe(false);
    });
});
