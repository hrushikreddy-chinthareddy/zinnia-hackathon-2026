import Autocomplete from '@deps/components/autocomplete/autocomplete';
import { FieldSize, FieldVariant } from '@deps/components/fields/field';
import { ParticipantCompanies } from '@deps/models/case/withdrawal/case';

interface DtccSelectParticipantIdProps {
    fieldLabel: string;
    fieldName: string;
    value?: string;
    isFormStateReadOnly?: boolean;
    onDataChange: (val: string) => void;
}

const DtccSelectParticipantId = ({
    fieldLabel,
    fieldName,
    value,
    isFormStateReadOnly,
    onDataChange,
}: DtccSelectParticipantIdProps) => {
    const participantIdOptions = ParticipantCompanies.map((company) => {
        return {
            label: `${company.companyName}`,
            value: company.code,
        };
    });

    return (
        <Autocomplete
            className="max-w-lg"
            label={fieldLabel}
            options={participantIdOptions}
            onChange={(val: string) => onDataChange(val as any)}
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

export default DtccSelectParticipantId;
