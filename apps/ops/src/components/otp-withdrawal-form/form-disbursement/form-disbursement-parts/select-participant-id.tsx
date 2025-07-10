import Autocomplete from '@deps/components/autocomplete/autocomplete';
import { FieldSize, FieldVariant } from '@deps/components/fields/field';
import { ParticipantCompanies } from '@deps/models/case/withdrawal/case';
import { DisbursementInformation } from '@deps/models/case/withdrawal/disbursement-types';

const SelectParticipantId = ({
    fieldLabel,
    fieldName,
    disbursementInformation,
    isFormStateReadOnly,
    onDataChange,
}: DisbursementInformation) => {
    const value = disbursementInformation.participantId ?? '';
    const participantIdOptions = ParticipantCompanies.map((company) => {
        return {
            label: `${company.companyName}`,
            value: company.code,
        };
    });

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
            options={participantIdOptions}
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
