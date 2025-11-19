import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import SelectSimple from '@deps/components/select/select';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { stringifyTrueFalseNull } from '@deps/helpers/string.helpers';
import {
    NonRegTypeReason,
    QualTypes,
    RegReason,
} from '@deps/models/case/withdrawal/case';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import {
    authorizedPersonSignPresentoptions,
    invalidOwnerRegReasons,
    isChecked,
    toggleOption,
    validButtonGroupOptions,
    yesNoButtonGroupOptions,
} from './ceding-company-signature.helpers';
import Autocomplete from '../autocomplete/autocomplete';
import CheckboxText from '../checkbox/checkbox-text/checkbox-text';
import { FieldSize, FieldType, FieldVariant } from '../fields/field';
import FieldDateSelect, {
    DATE_PICKER_FORMAT,
} from '../fields/field-date-select/field-date-select';
import SelectValidButtonGroup from '../otp-withdrawal-form/select-valid-button-group';
import Typography, { TypographyVariant } from '../typography/typography';

export type CedingCompanySignatureProps = {
    renderCorporateResolution?: boolean;
    renderNewCorporateResolution?: boolean;
    renderIsTitlePresent?: boolean;
    renderIsLoaAttached?: boolean;
    isFormStateReadOnly?: boolean;
    renderLoaDate?: boolean;
    qualificationOptions: { label: string; value: QualTypes }[];
    authorizedSignatureLabel?: string;
};

export interface FormSurrenderingSignature {
    qualType: { text: string } | null;
    multipleQualType: { text: boolean } | null;
    authorizedOfficerSignature: { text: string } | null;
    loa: { text: boolean } | null;
    registrationType: { text: string } | null;
    nonRegTypeReason: RegReason<NonRegTypeReason>[] | [] | null;
    isTitlePresent: { text: boolean } | null;
    loaSignDate: { text: string } | null;
    corporateResolution: { text: string } | null;
    authorizedOfficerSignatureDate: { text: string } | null;
}

const CedingCompanySignature = ({
    qualificationOptions,
    renderCorporateResolution = true,
    renderNewCorporateResolution = false,
    renderIsLoaAttached = true,
    renderIsTitlePresent = false,
    isFormStateReadOnly = false,
    renderLoaDate = false,
    authorizedSignatureLabel,
}: CedingCompanySignatureProps) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.oftProcess',
    });
    const { formSurrenderingCompany, setFormSurrenderingCompany } =
        useContext(FormDataContext);

    const [selectedRegReasons, setSelectedRegReasons] = useState(
        formSurrenderingCompany?.nonRegTypeReason || []
    );

    const handleChange = (key: string, value: string | boolean) => {
        setFormSurrenderingCompany((prevState: FormSurrenderingSignature) => ({
            ...prevState,
            [key]: { text: value },
        }));
    };

    useEffect(() => {
        setFormSurrenderingCompany((prevState: FormSurrenderingSignature) => ({
            ...prevState,
            nonRegTypeReason: selectedRegReasons,
        }));
    }, [selectedRegReasons]);

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <Typography
                variant={TypographyVariant.H3}
                className="mb-4"
                data-testid="title"
            >
                {t('cedingCompanySignature.title')}
            </Typography>
            {/* qualType */}
            <Autocomplete
                className="max-w-lg"
                label={t('cedingCompanySignature.qualType') as string}
                options={qualificationOptions}
                onChange={(val: string) =>
                    handleChange('qualType', val as QualTypes)
                }
                size={FieldSize.Small}
                value={formSurrenderingCompany?.qualType?.text || ''}
                data-testid="qualType"
                disabled={isFormStateReadOnly}
                variant={
                    isFormStateReadOnly
                        ? FieldVariant.Inactive
                        : FieldVariant.Default
                }
            />
            {/* multiple Qual Type */}
            <div className="my-2 flex flex-wrap gap-8 max-md:flex-col">
                <CheckboxText
                    label={t('cedingCompanySignature.multipleQualType')}
                    checked={
                        formSurrenderingCompany?.multipleQualType
                            ?.text as boolean
                    }
                    onChange={(val) => handleChange('multipleQualType', val)}
                    isDisabled={isFormStateReadOnly}
                />
            </div>
            {/* corporateResolution */}
            <div className="my-2 flex flex-wrap gap-8">
                {renderNewCorporateResolution && (
                    <SelectValidButtonGroup
                        options={validButtonGroupOptions(t)}
                        isValid={
                            formSurrenderingCompany?.corporateResolution
                                ?.text ?? ''
                        }
                        setIsValid={(val) =>
                            handleChange('corporateResolution', val)
                        }
                        label={
                            authorizedSignatureLabel ||
                            (t(
                                'cedingCompanySignature.isCorporateResolutionPresent'
                            ) as string)
                        }
                        disabled={isFormStateReadOnly}
                    />
                )}
            </div>
            {/* selectAuthSignedPresent New -- Applicable for OFT- FLIC & GDMN*/}
            <div className="my-2 flex flex-wrap gap-10">
                {formSurrenderingCompany?.corporateResolution?.text ===
                    stringifyTrueFalseNull('true') && (
                    <div className="mt-3 grid grid-cols-2 gap-10">
                        <SelectSimple
                            data-testid="selectAuthSignedPresent"
                            key={'selectAuthSignedPresent'}
                            options={authorizedPersonSignPresentoptions(t)}
                            value={stringifyTrueFalseNull(
                                formSurrenderingCompany
                                    ?.authorizedOfficerSignature?.text
                            )}
                            onChange={(val) =>
                                handleChange('authorizedOfficerSignature', val)
                            }
                            label={
                                t(
                                    'cedingCompanySignature.authPersonSignPresent'
                                ) as string
                            }
                            disabled={isFormStateReadOnly}
                            size={FieldSize.Small}
                        />
                        <div className="self-end">
                            <FieldDateSelect
                                id="auth-person-sign-date"
                                isFutureDateDisabled={false}
                                onChange={(e) => {
                                    handleChange(
                                        'authorizedOfficerSignatureDate',
                                        dayjs(
                                            e.target.value,
                                            DATE_PICKER_FORMAT
                                        ).format(ZAHARA_API_DATE_FORMAT)
                                    );
                                }}
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={
                                    formSurrenderingCompany
                                        .authorizedOfficerSignatureDate?.text
                                        ? dayjs(
                                              formSurrenderingCompany
                                                  ?.authorizedOfficerSignatureDate
                                                  ?.text,
                                              ZAHARA_API_DATE_FORMAT
                                          ).format(DATE_PICKER_FORMAT)
                                        : ''
                                }
                                label={
                                    t(
                                        'cedingCompanySignature.signDate'
                                    ) as string
                                }
                                disabled={isFormStateReadOnly}
                                variant={
                                    isFormStateReadOnly
                                        ? FieldVariant.Inactive
                                        : FieldVariant.Default
                                }
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Corporate Resolution Existing */}
            <div className="my-2 flex flex-wrap gap-8">
                {renderCorporateResolution && !renderNewCorporateResolution && (
                    <SelectValidButtonGroup
                        options={validButtonGroupOptions(t)}
                        isValid={
                            formSurrenderingCompany?.authorizedOfficerSignature
                                ?.text ?? false
                        }
                        setIsValid={(val) =>
                            handleChange('authorizedOfficerSignature', val)
                        }
                        label={
                            authorizedSignatureLabel ||
                            (t(
                                'cedingCompanySignature.isSignatureValid'
                            ) as string)
                        }
                        disabled={isFormStateReadOnly}
                    />
                )}
                {/* is Title Present */}
                {renderIsTitlePresent && (
                    <SelectValidButtonGroup
                        options={validButtonGroupOptions(t)}
                        isValid={
                            formSurrenderingCompany?.isTitlePresent?.text ??
                            false
                        }
                        setIsValid={(val) =>
                            handleChange('isTitlePresent', val)
                        }
                        label={
                            t('cedingCompanySignature.isTitlePresent') as string
                        }
                        disabled={isFormStateReadOnly}
                    />
                )}
                <div className="flex flex-wrap gap-10">
                    {/* is Loa Attached  */}
                    {renderIsLoaAttached && (
                        <SelectValidButtonGroup
                            options={validButtonGroupOptions(t)}
                            isValid={
                                formSurrenderingCompany?.loa?.text ?? false
                            }
                            setIsValid={(val) => handleChange('loa', val)}
                            disabled={isFormStateReadOnly}
                            label={
                                t(
                                    'cedingCompanySignature.isLoaAttached'
                                ) as string
                            }
                        />
                    )}

                    {/* LOA Sign Date */}
                    {renderIsLoaAttached && renderLoaDate && (
                        <div className="self-end">
                            <FieldDateSelect
                                id="loaSignDate"
                                isFutureDateDisabled={false}
                                onChange={(e) => {
                                    handleChange(
                                        'loaSignDate',
                                        dayjs(
                                            e.target.value,
                                            DATE_PICKER_FORMAT
                                        ).format(ZAHARA_API_DATE_FORMAT)
                                    );
                                }}
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={
                                    formSurrenderingCompany?.loaSignDate?.text
                                        ? dayjs(
                                              formSurrenderingCompany
                                                  ?.loaSignDate?.text,
                                              ZAHARA_API_DATE_FORMAT
                                          ).format(DATE_PICKER_FORMAT)
                                        : ''
                                }
                                label={
                                    t(
                                        'cedingCompanySignature.loaSignDate'
                                    ) as string
                                }
                                disabled={isFormStateReadOnly}
                                variant={
                                    isFormStateReadOnly
                                        ? FieldVariant.Inactive
                                        : FieldVariant.Default
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
            {/* Registration Type */}
            <div className="grid grid-cols-2 gap-10">
                <SelectValidButtonGroup
                    options={yesNoButtonGroupOptions(t)}
                    isValid={
                        formSurrenderingCompany?.registrationType?.text ?? false
                    }
                    disabled={isFormStateReadOnly}
                    setIsValid={(val: string) =>
                        handleChange('registrationType', val)
                    }
                    label={
                        t('cedingCompanySignature.registrationType') as string
                    }
                />
            </div>

            {/* Registration Reason Checkbox */}
            {formSurrenderingCompany?.registrationType?.text ===
                stringifyTrueFalseNull(false) && (
                <div className="flex flex-col gap-4 mt-3">
                    {invalidOwnerRegReasons(t)?.map(({ label, value }) => {
                        return (
                            <div
                                className="flex flex-wrap gap-8 max-md:flex-col"
                                key={`hardshipSelect-${value}`}
                            >
                                <CheckboxText
                                    checked={isChecked(
                                        value,
                                        selectedRegReasons
                                    )}
                                    label={label}
                                    onChange={toggleOption(
                                        value,
                                        setSelectedRegReasons
                                    )}
                                    isDisabled={isFormStateReadOnly}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </CardContainer>
    );
};

export default CedingCompanySignature;
