import { SetStateAction } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { Restriction } from '@deps/models/case/withdrawal/case';

import { Option } from './distribution-reason';
export type OptionComponentProps<T> = {
    legend: string;
    options: Option<T>[];
    restriction: Restriction<T>[];
    classes?: (subElement: JSX.Element) => string;
    setRestriction: (value: SetStateAction<Restriction<T>[]>) => void;
    isFormStateReadOnly?: boolean;
};

function isChecked<T>(val: T, restrictions: Restriction<T>[]): boolean {
    return !!restrictions.find((restriction) => restriction.text === val);
}

function toggleRestriction<T>(
    val: T,
    setRestrictions: React.Dispatch<React.SetStateAction<Restriction<T>[]>>
) {
    return (shouldHaveRestriction: boolean) => {
        setRestrictions((restrictions) => {
            const hasRestriction = restrictions.find(
                (checkedRestriction) => checkedRestriction.text === val
            );
            if (hasRestriction && !shouldHaveRestriction) {
                return restrictions.filter(
                    (checkedRestriction) => checkedRestriction.text !== val
                );
            }

            if (!hasRestriction && shouldHaveRestriction) {
                const newRestriction = {
                    text: val,
                    selectionOptions: {},
                };
                return [...restrictions, newRestriction];
            }

            return restrictions;
        });
    };
}

export default function RestrictionOptionComponent<T>({
    options,
    restriction,
    setRestriction,
    legend,
    classes,
    isFormStateReadOnly,
}: OptionComponentProps<T>) {
    return (
        <fieldset>
            <legend className="mb-2">
                <Typography variant={TypographyVariant.Label}>
                    {legend}
                </Typography>
            </legend>
            <div className="flex flex-col gap-4">
                {options.map(({ label, value, subElement }) => {
                    const containerClasses =
                        subElement && classes ? classes(subElement) : '';
                    return (
                        <div
                            key={`${legend}Select-${value}`}
                            className={containerClasses}
                        >
                            <div className="flex flex-wrap gap-8 max-md:flex-col">
                                <CheckboxText
                                    checked={isChecked(value, restriction)}
                                    label={label}
                                    onChange={toggleRestriction(
                                        value,
                                        setRestriction
                                    )}
                                    isDisabled={isFormStateReadOnly}
                                />

                                {subElement}
                            </div>
                        </div>
                    );
                })}
            </div>
        </fieldset>
    );
}
