import { useContext } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { SignVerificationReason } from '@deps/models/case/withdrawal/case';

export type SignVerificationReasonItem = {
    label: string;
    value: SignVerificationReason;
};

export type ISignatureVerificationReasonsProps = {
    config: Array<SignVerificationReasonItem>;
    checkedItems: SignVerificationReason[];
    isFormStateReadOnly?: boolean;
};

export default function SignatureVerificationReasons({ config, checkedItems, isFormStateReadOnly }: ISignatureVerificationReasonsProps) {
    const formDataContext = useContext(FormDataContext);

    const onStatusChangeHandler = (value: SignVerificationReason) => () => {
        formDataContext.setFormSignature(fs => {
            if (fs.signVerificationReason) {
                if (fs.signVerificationReason.some(item => item.text === value)) {
                    return { ...fs, signVerificationReason: fs.signVerificationReason.filter(reason => reason.text !== value) };
                }

                return { ...fs, signVerificationReason: [...fs.signVerificationReason, { text: value }] };
            } else {
                return { ...fs, signVerificationReason: [{ text: value }] };
            }
        });
    };

    return (
        <div className="flex flex-col space-y-2">
            {config.map((option: SignVerificationReasonItem) => (
                <div key={`verification-reason-${option.value}`}>
                    <CheckboxText
                        label={option.label}
                        data-testid={`verification-reason-test-id-${option.value}`}
                        checked={checkedItems.includes(option.value)}
                        onChange={onStatusChangeHandler(option.value)}
                        isDisabled={isFormStateReadOnly}
                    />
                </div>
            ))}
        </div>
    );
}
