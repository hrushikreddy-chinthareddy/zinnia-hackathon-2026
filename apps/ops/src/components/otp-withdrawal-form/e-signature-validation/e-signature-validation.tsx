import { useTranslation } from 'next-i18next';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import CardContainer from '@deps/containers/card-container/card-container';

import ESignatureFields from './e-signature-fields';
import { FormEsignatureData, SelectionStateYesNo } from './e-signature-validation.helpers';

interface ESignatureValidationProps {
    formESignatureData: FormEsignatureData;
    setFormESignatureData: React.Dispatch<React.SetStateAction<any>>;
    fieldConfig: {
        type: boolean;
        signPresent: boolean;
        date: boolean;
        auditTrial?: boolean;
        accordForm?: boolean;
    };
    formErrors: Record<string, string>;
    isFormStateReadOnly: boolean;
}

const ESignatureValidation: React.FC<ESignatureValidationProps> = ({
    formESignatureData,
    setFormESignatureData,
    fieldConfig,
    formErrors,
    isFormStateReadOnly,
}) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.eSignatureValidation' });

    const selectYesNoOptions = [
        { label: t('selectOption'), value: SelectionStateYesNo.Unselected },
        { label: t('yes'), value: SelectionStateYesNo.Yes },
        { label: t('no'), value: SelectionStateYesNo.No },
    ];

    const updateFormESignatureField = (index: number, field: string, value: string | object | boolean) => {
        setFormESignatureData((prev: ESignatureValidationProps['formESignatureData']) => {
            const updatedSignatures = [...prev.eSignatures];
            updatedSignatures[index] = {
                ...updatedSignatures[index],
                [field]: value,
            };
            return {
                ...prev,
                eSignatures: updatedSignatures,
            };
        });
    };

    return (
        <>
            <CardContainer containerClassNames="border-b-2 border-gray-100" classNames="w-full">
                <div className="flex-1 mt-5">
                    <CheckboxText
                        label={t('title')}
                        checked={formESignatureData.isFormESignaturePresent}
                        onChange={() =>
                            setFormESignatureData((prev: ESignatureValidationProps['formESignatureData']) => ({
                                ...prev,
                                isFormESignaturePresent: !prev.isFormESignaturePresent,
                            }))
                        }
                        isDisabled={isFormStateReadOnly}
                    />
                </div>
                {formESignatureData?.isFormESignaturePresent && (
                    <ESignatureFields
                        isFormStateReadOnly={isFormStateReadOnly}
                        eSignatures={formESignatureData.eSignatures}
                        fieldConfig={fieldConfig}
                        formErrors={formErrors}
                        selectYesNoOptions={selectYesNoOptions}
                        updateFormESignatureField={updateFormESignatureField}
                        t={t}
                    />
                )}
            </CardContainer>
        </>
    );
};

export default ESignatureValidation;
