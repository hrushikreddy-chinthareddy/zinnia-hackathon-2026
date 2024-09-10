import { useEffect, useState } from 'react';

import ButtonGrp from '@deps/components/button-group/button-group';
import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import { deStringifyTrueFalseNull, stringifyTrueFalseNull } from '@deps/helpers/string.helper';
import { PolicyWaiver, SelectOption } from '@deps/models/case/withdrawal/case';

import { WaiverItemConfig } from './form-waivers';

export type WaiverItemAction = 'ADD' | 'REMOVE';
export type StatusData = {
    text: PolicyWaiver;
    selectionOptions: SelectOption;
    action: WaiverItemAction;
};

export type WaiverItemProps = WaiverItemConfig & {
    selectedOption: SelectOption | undefined;
    isFormStateReadOnly?: boolean;
    onChange: (val: StatusData) => void;
};

export const FormWaiverItem = ({ id, title, optionTitle, options, selectedOption, isFormStateReadOnly, onChange }: WaiverItemProps) => {
    const [isVisible, setIsVisible] = useState(!!selectedOption || false);
    const [waiverStatus, setWaiverStatus] = useState(stringifyTrueFalseNull(selectedOption?.isValid?.text));

    useEffect(() => {
        onChange({
            text: id,
            action: isVisible ? 'ADD' : 'REMOVE',
            selectionOptions: {
                isValid: {
                    text: deStringifyTrueFalseNull(waiverStatus) as boolean | null,
                },
            },
        });
    }, [isVisible, waiverStatus, onChange, id]);

    return (
        <div className="mb-2 mt-4">
            <div className="mb-4">
                <CheckboxText isDisabled={isFormStateReadOnly} data-testid={`${id}-checkbox`} label={title} checked={isVisible} onChange={setIsVisible} />
            </div>
            {isVisible && (
                <ButtonGrp
                    data-testid={`${id}-buttongroup`}
                    activeValue={waiverStatus}
                    groupLabel={optionTitle}
                    toggle={val => {
                        setWaiverStatus(val);
                    }}
                    labels={options}
                    disabled={isFormStateReadOnly}
                />
            )}
        </div>
    );
};
