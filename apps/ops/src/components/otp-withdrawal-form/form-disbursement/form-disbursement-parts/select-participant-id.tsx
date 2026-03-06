import { useContext } from 'react';

import Autocomplete from '@deps/components/autocomplete/autocomplete';
import { FieldSize, FieldVariant } from '@deps/components/fields/field';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { TaskType } from '@deps/models/case/task';
import {
    Carrier,
    filterParticipantIdRules,
    getFilteredParticipantCompanies,
} from '@deps/models/case/withdrawal/case';
import { DisbursementInformation } from '@deps/models/case/withdrawal/disbursement-types';

type FilterParticipantIdRules = {
    clients: Carrier;
    taskType: TaskType | TaskType[];
    excludeParticipantCodes: string[];
};

type SelectedParticipantId = {
    code: string;
    companyName: string;
};

const SelectParticipantId = ({
    fieldLabel,
    fieldName,
    disbursementInformation,
    isFormStateReadOnly,
    onDataChange,
}: DisbursementInformation) => {
    const { initialForm } = useContext(FormDataContext);
    const value = disbursementInformation.participantId ?? '';

    const participantIdOptions = () => {
        const baseCompanies = getFilteredParticipantCompanies(
            initialForm?.carrier as Carrier,
            initialForm?.taskType
        );

        const matchedRule = filterParticipantIdRules.find(
            (rule: FilterParticipantIdRules) =>
                rule.clients === initialForm?.carrier &&
                rule.taskType.includes(initialForm?.taskType)
        );

        const filteredCompanies = matchedRule
            ? baseCompanies.filter(
                  (p: { code: string }) =>
                      !matchedRule.excludeParticipantCodes.includes(p.code)
              )
            : baseCompanies;

        return filteredCompanies.map(
            (participantId: SelectedParticipantId) => ({
                label: `${participantId.companyName}`,
                value: participantId.code,
            })
        );
    };

    const setDataChange = (val: string) => {
        onDataChange((ogData) => ({
            ...ogData,
            [fieldName]: val,
        }));
    };

    return (
        <Autocomplete
            className="max-w-lg"
            label={fieldLabel}
            options={participantIdOptions()}
            onChange={(val: string) => setDataChange(val)}
            size={FieldSize.Small}
            value={value}
            data-testid={fieldName}
            disabled={isFormStateReadOnly}
            variant={
                isFormStateReadOnly
                    ? FieldVariant.Inactive
                    : FieldVariant.Default
            }
        />
    );
};

export default SelectParticipantId;
