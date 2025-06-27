import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import Field, {
    FieldFormat,
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldLabel from '@deps/components/fields/field-label';
import { RenewalFormDataContext } from '@deps/contexts/OtpRenewalFormContext';

interface ContractValueProps {
    isFormStateReadOnly?: boolean;
}
const ContractValue = ({ isFormStateReadOnly }: ContractValueProps) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseRenewal.request',
    });
    const { contractValue, setContractValue } = useContext(
        RenewalFormDataContext
    );
    const numberFormat = {
        type: 'number' as FieldFormat,
        decimalPlaces: 2,
        format: '',
    };

    return (
        <div className="grid gap-x-12 sm:grid sm:grid-cols-1 md:grid md:grid-cols-2 lg:grid lg:grid-cols-2">
            <div className="my-2 flex items-center gap-4">
                <div data-testid="contract-value-label">
                    <FieldLabel
                        labelClassNames="text-md mr-2"
                        label={t(`contractValue`) as string}
                    />
                </div>
                <Field
                    formatOptions={numberFormat}
                    value={contractValue as string}
                    size={FieldSize.Small}
                    leading={<div>$</div>}
                    type={FieldType.BaseActive}
                    variant={
                        isFormStateReadOnly
                            ? FieldVariant.Inactive
                            : FieldVariant.Default
                    }
                    onChange={(e) => {
                        setContractValue(Number(e.target.value) || '');
                    }}
                    data-testid="contract-value-test-id"
                    disabled={isFormStateReadOnly}
                />
            </div>
        </div>
    );
};

export default ContractValue;
