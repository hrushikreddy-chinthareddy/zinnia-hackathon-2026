import xss from 'xss';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Field, { FieldSize, FieldType } from '@deps/components/fields/field';
import { selectVarientByConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

import {
    EXTENSION_FORMAT,
    PHONE_NUMBER_FORMAT,
} from '../../utils/reg60-constants';
import {
    UserInformationConfig,
    UserInfo,
} from '../user-information/user-information.type';

type UserPhoneNumberProps = {
    phoneDetails: UserInfo;
    onPhoneDetailsChange: React.Dispatch<React.SetStateAction<UserInfo>>;
    formErrors: FormValidationErrors;
    formConfig: UserInformationConfig;
    isFormStateReadOnly: boolean;
};

const UserPhoneNumber = ({
    phoneDetails,
    onPhoneDetailsChange,
    formConfig,
    formErrors,
    isFormStateReadOnly,
}: UserPhoneNumberProps) => {
    const personalInfo = phoneDetails.personalInformation;

    const handlePhoneOptionChange = (value: { [key: string]: boolean }) => {
        onPhoneDetailsChange({
            ...phoneDetails,
            personalInformation: {
                ...personalInfo,
                phoneType: {
                    ...personalInfo?.phoneType,
                    ...value,
                },
            },
        });
    };
    return (
        <div className="flex gap-4">
            {formConfig.userFields.fields.userPhoneNumber && (
                <Field
                    label={
                        formConfig.userFields.fields.userPhoneNumber?.fieldLabel
                    }
                    onChange={(e) =>
                        onPhoneDetailsChange({
                            ...phoneDetails,
                            personalInformation: {
                                ...personalInfo,
                                phoneNumber: xss(e.target.value),
                            },
                        })
                    }
                    size={FieldSize.Small}
                    data-testid={'owner-phone-number'}
                    type={FieldType.BaseActive}
                    value={personalInfo?.phoneNumber}
                    formatOptions={PHONE_NUMBER_FORMAT}
                    variant={selectVarientByConfig({
                        value: personalInfo.phoneNumber,
                        isFormStateReadOnly,
                        error: formErrors?.phoneNumber,
                    })}
                />
            )}

            {formConfig.userFields.fields.extension && (
                <Field
                    label={formConfig.userFields.fields.extension?.fieldLabel}
                    onChange={(e) =>
                        onPhoneDetailsChange({
                            ...phoneDetails,
                            personalInformation: {
                                ...personalInfo,
                                phoneExtension: xss(e.target.value),
                            },
                        })
                    }
                    size={FieldSize.Small}
                    data-testid="phoneExtension"
                    type={FieldType.BaseActive}
                    value={personalInfo?.phoneExtension}
                    formatOptions={EXTENSION_FORMAT}
                    variant={selectVarientByConfig({
                        value: personalInfo.phoneExtension as string,
                        isFormStateReadOnly,
                        error: formErrors?.phoneExtension,
                    })}
                />
            )}

            {formConfig.userFields.fields.phoneType && (
                <div
                    className="flex items-end gap-4 p-2"
                    data-testid="owner-phone-type"
                >
                    {formConfig.userFields.fields.phoneType.home && (
                        <CheckboxText
                            isDisabled={isFormStateReadOnly}
                            label={
                                formConfig.userFields.fields.phoneType?.home
                                    ?.fieldLabel
                            }
                            checked={personalInfo?.phoneType?.home}
                            onClick={() =>
                                handlePhoneOptionChange({
                                    home: !personalInfo?.phoneType?.home,
                                })
                            }
                        />
                    )}
                    {formConfig.userFields.fields.phoneType.work && (
                        <CheckboxText
                            isDisabled={isFormStateReadOnly}
                            label={
                                formConfig.userFields.fields.phoneType?.work
                                    ?.fieldLabel
                            }
                            checked={personalInfo?.phoneType?.work}
                            onClick={() =>
                                handlePhoneOptionChange({
                                    work: !personalInfo?.phoneType?.work,
                                })
                            }
                        />
                    )}
                    {formConfig.userFields.fields.phoneType.mobile && (
                        <CheckboxText
                            isDisabled={isFormStateReadOnly}
                            label={
                                formConfig.userFields.fields.phoneType?.mobile
                                    ?.fieldLabel
                            }
                            checked={personalInfo?.phoneType?.mobile}
                            onClick={() =>
                                handlePhoneOptionChange({
                                    mobile: !personalInfo?.phoneType?.mobile,
                                })
                            }
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default UserPhoneNumber;
