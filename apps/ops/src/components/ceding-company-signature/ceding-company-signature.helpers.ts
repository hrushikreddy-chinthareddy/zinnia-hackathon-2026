import { TFunction } from 'next-i18next';

import { stringifyTrueFalseNull } from '@deps/helpers/string.helpers';
import { NonRegTypeReason, RegReason } from '@deps/models/case/withdrawal/case';

export const validButtonGroupOptions = (t: TFunction) => [
    { label: t('yes'), value: stringifyTrueFalseNull(true) },
    { label: t('no'), value: stringifyTrueFalseNull(false) },
];

export const yesNoButtonGroupOptions = (t: TFunction) => [
    { label: t('valid'), value: stringifyTrueFalseNull(true) },
    { label: t('notValid'), value: stringifyTrueFalseNull(false) },
];

export const invalidOwnerRegReasons = (t: TFunction) => [
    {
        label: t('nonRegTypeReason.jointOwnerAbsent'),
        value: NonRegTypeReason.JointOwnerAbsent,
    },
    {
        label: t('nonRegTypeReason.missingInfoLoa'),
        value: NonRegTypeReason.MissingInfoLoa,
    },
    {
        label: t('nonRegTypeReason.incorrectNameAnnuitant'),
        value: NonRegTypeReason.IncorrectNameAnnuitant,
    },
];

export function toggleOption<T>(
    val: T,
    setSelectedRegReasons: React.Dispatch<React.SetStateAction<RegReason<T>[]>>
) {
    return (shouldHaveReason: boolean) => {
        setSelectedRegReasons((reasons) => {
            const hasReason = reasons.find(
                (checkedReason) => checkedReason.text === val
            );
            if (hasReason && !shouldHaveReason) {
                return reasons.filter(
                    (checkedReason) => checkedReason.text !== val
                );
            }

            // checking if selectedRegReasons has current value
            if (!hasReason && shouldHaveReason) {
                const newRestriction = {
                    text: val,
                };
                return [...reasons, newRestriction];
            }

            return reasons;
        });
    };
}

export function isChecked<T>(
    val: T,
    selectedRegReasons: RegReason<T>[]
): boolean {
    return !!selectedRegReasons.find((regReason) => regReason.text === val);
}

export const authorizedPersonSignPresentoptions = (t: TFunction) => [
    { label: t('selectOption'), value: stringifyTrueFalseNull(null) },
    { label: t('yes'), value: stringifyTrueFalseNull(true) },
    { label: t('no'), value: stringifyTrueFalseNull(false) },
];
