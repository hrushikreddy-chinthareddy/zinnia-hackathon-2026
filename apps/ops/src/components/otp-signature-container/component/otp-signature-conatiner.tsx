import SignatureValidation from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation';
import { SignatureFieldNames } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { getDefaultSignature } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    FormSignature,
    FormValidationErrors,
    SignatureWithdrawal,
} from '@deps/models/case/withdrawal/case';

import { SignatureValidationContainerConfig } from '../helpers/types';

type SignatureValidationProps = {
    errorData: any;
    signatureData: FormSignature;
    config: SignatureValidationContainerConfig[];
    isFormStateReadOnly?: boolean;
    onSignatureSet: (
        signatureType: SignatureValidationTypeWithdrawal,
        val: SignatureWithdrawal
    ) => void;
    ownerName?: string;
    jointOwnerName?: string;
    annuitantName?: string;
};

export default function SignatureValidationContainer({
    errorData,
    signatureData,
    config,
    isFormStateReadOnly,
    onSignatureSet,
    ownerName,
    jointOwnerName,
    annuitantName,
}: SignatureValidationProps) {
    const setSignature =
        (signatureType: SignatureValidationTypeWithdrawal) =>
        (val: SignatureWithdrawal) => {
            onSignatureSet(signatureType, val);
        };

    const getErrors = (
        signatureType: SignatureValidationTypeWithdrawal
    ): FormValidationErrors => {
        return {
            [SignatureFieldNames.IsSignatureValid]:
                errorData[
                    `${signatureType}${SignatureFieldNames.IsSignatureValid}`
                ],
            [SignatureFieldNames.SignatureComment]:
                errorData[
                    `${signatureType}${SignatureFieldNames.SignatureComment}`
                ],
            [SignatureFieldNames.SignatureDate]:
                errorData[
                    `${signatureType}${SignatureFieldNames.SignatureDate}`
                ],
            [SignatureFieldNames.SignaturePresent]:
                errorData[
                    `${signatureType}${SignatureFieldNames.SignaturePresent}`
                ],
            [SignatureFieldNames.SignatureTitle]:
                errorData[
                    `${signatureType}${SignatureFieldNames.SignatureTitle}`
                ],
            [SignatureFieldNames.SignatureType]:
                errorData[
                    `${signatureType}${SignatureFieldNames.SignatureType}`
                ],
        };
    };

    return (
        <>
            {config
                .filter((item) =>
                    item?.shouldDisplay ? item?.shouldDisplay() : true
                )
                .map(({ signatureType, fields, bonusField }) => {
                    // TODO: Init default signature in Signature provider context.
                    const signProcessing =
                        signatureData.signatures.find(
                            (val) => val.signType?.text === signatureType
                        ) || getDefaultSignature(signatureType);
                    let signCl = signProcessing;
                    if (
                        signProcessing.signType.text ===
                            SignatureValidationTypeWithdrawal.Owner &&
                        ownerName
                    ) {
                        signCl = { ...signProcessing, signName: ownerName };
                    }
                    if (
                        signProcessing.signType.text ===
                            SignatureValidationTypeWithdrawal.JointOwner &&
                        jointOwnerName
                    ) {
                        signCl = {
                            ...signProcessing,
                            signName: jointOwnerName,
                        };
                    }
                    if (
                        signProcessing.signType?.text ===
                            SignatureValidationTypeWithdrawal.Annuitant &&
                        annuitantName
                    ) {
                        signCl = { ...signProcessing, signName: annuitantName };
                    }

                    return (
                        <div className="mt-6" key={`sig-val-${signatureType}`}>
                            <SignatureValidation
                                bonusField={bonusField}
                                errors={getErrors(signatureType)}
                                fields={fields}
                                onDataChange={setSignature(signatureType)}
                                sigProp={signCl as SignatureWithdrawal}
                                isFormStateReadOnly={isFormStateReadOnly}
                            />
                        </div>
                    );
                })}
        </>
    );
}
