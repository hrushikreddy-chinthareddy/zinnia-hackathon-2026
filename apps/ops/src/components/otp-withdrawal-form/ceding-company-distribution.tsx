import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import React, { useContext, useEffect, useState } from 'react';

import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import {
    deStringifyTrueFalseNull,
    stringifyTrueFalseNull,
} from '@deps/helpers/string.helpers';
import {
    NonRegTypeReason,
    QualTypes,
    RegReason,
} from '@deps/models/case/withdrawal/case';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import SelectValidButtonGroup from './select-valid-button-group';
import Autocomplete from '../autocomplete/autocomplete';
import CheckboxText from '../checkbox/checkbox-text/checkbox-text';
import { FieldSize, FieldType, FieldVariant } from '../fields/field';
import FieldDateSelect, {
    DATE_PICKER_FORMAT,
} from '../fields/field-date-select/field-date-select';
import Typography, { TypographyVariant } from '../typography/typography';

// updating the registration type reasons on checkbox checked.
function toggleOption<T>(
    val: T,
    setSelectedRegReasons: React.Dispatch<React.SetStateAction<RegReason<T>[]>>
) {
    return (shouldHaveReason: boolean) => {
        setSelectedRegReasons((reasons) => {
            const hasReason = reasons.find(
                (checkedReason) => checkedReason.text === val
            );
            if (hasReason && !shouldHaveReason) {
                return reasons.filter(
                    (checkedReason) => checkedReason.text !== val
                );
            }

            // checking if selectedRegReasons has current value
            if (!hasReason && shouldHaveReason) {
                const newRestriction = {
                    text: val,
                };
                return [...reasons, newRestriction];
            }

            return reasons;
        });
    };
}

export type CedingCompanyDistributionProps = {
    renderCorporateResolution?: boolean;
    renderIsTitlePresent?: boolean;
    renderIsLoaAttached?: boolean;
    isFormStateReadOnly?: boolean;
    renderLoaDate?: boolean;
    qualificationOptions: { label: string; value: QualTypes }[];
    authorizedSignatureLabel?: string;
};

const CedingCompanyDistribution = ({
    qualificationOptions,
    renderCorporateResolution = true,
    renderIsLoaAttached = true,
    renderIsTitlePresent = false,
    isFormStateReadOnly = false,
    renderLoaDate = false,
    authorizedSignatureLabel,
}: CedingCompanyDistributionProps) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.oftProcess',
    });
    const { formSurrenderingCompany, setFormSurrenderingCompany } =
        useContext(FormDataContext);
    const [qualType, setQualType] = useState(
        formSurrenderingCompany?.qualType?.text || ''
    );
    const [isMultipleQualType, setIsMultipleQualType] = useState<boolean>(
        formSurrenderingCompany?.multipleQualType?.text || false
    );
    const [isSignValid, setIsSignValid] = useState<string>(
        stringifyTrueFalseNull(
            formSurrenderingCompany?.authorizedOfficerSignature?.text
        )
    );
    const [isLoaAttached, setIsLoaAttached] = useState<string>(
        stringifyTrueFalseNull(formSurrenderingCompany?.loa?.text)
    );
    const loaDate = formSurrenderingCompany?.loaSignDate?.text;
    const [loaSignDate, setLoaSignDate] = useState<string>(
        loaDate
            ? dayjs(loaDate, ZAHARA_API_DATE_FORMAT).format(DATE_PICKER_FORMAT)
            : ''
    );
    const [isTitlePresent, setIsTitlePresent] = useState<string>(
        stringifyTrueFalseNull(formSurrenderingCompany?.isTitlePresent?.text)
    );
    const [isValidOwnerRegType, setIsValidOwnerRegType] = useState<string>(
        stringifyTrueFalseNull(formSurrenderingCompany?.registrationType?.text)
    );
    const [selectedRegReasons, setSelectedRegReasons] = useState(
        formSurrenderingCompany?.nonRegTypeReason || []
    );

    const validButtonGroupOptions = [
        { label: t('yes'), value: stringifyTrueFalseNull(true) },
        { label: t('no'), value: stringifyTrueFalseNull(false) },
    ];

    const yesNoButtonGroupOptions = [
        { label: t('valid'), value: stringifyTrueFalseNull(true) },
        { label: t('notValid'), value: stringifyTrueFalseNull(false) },
    ];

    const invalidOwnerRegReasons = [
        {
            label: t('nonRegTypeReason.jointOwnerAbsent'),
            value: NonRegTypeReason.JointOwnerAbsent,
        },
        {
            label: t('nonRegTypeReason.missingInfoLoa'),
            value: NonRegTypeReason.MissingInfoLoa,
        },
        {
            label: t('nonRegTypeReason.incorrectNameAnnuitant'),
            value: NonRegTypeReason.IncorrectNameAnnuitant,
        },
    ];

    // This was the solution to generic typing a method.
    function isChecked<T>(val: T, selectedRegReasons: RegReason<T>[]): boolean {
        return !!selectedRegReasons.find((regReason) => regReason.text === val);
    }

    useEffect(() => {
        setFormSurrenderingCompany((oldFormSurrenderingCompany) => {
            return {
                ...oldFormSurrenderingCompany,
                qualType: {
                    text: qualType,
                },
                multipleQualType: {
                    text: isMultipleQualType,
                },
                authorizedOfficerSignature: {
                    text: deStringifyTrueFalseNull(isSignValid) as boolean,
                },
                loa: {
                    text: deStringifyTrueFalseNull(isLoaAttached) as boolean,
                },
                isTitlePresent: {
                    text: deStringifyTrueFalseNull(isTitlePresent) as boolean,
                },
                registrationType: {
                    text: deStringifyTrueFalseNull(
                        isValidOwnerRegType
                    ) as boolean,
                },
                ...(renderIsLoaAttached &&
                    renderLoaDate &&
                    deStringifyTrueFalseNull(isLoaAttached) && {
                        loaSignDate: {
                            text: loaSignDate
                                ? dayjs(loaSignDate, DATE_PICKER_FORMAT).format(
                                      ZAHARA_API_DATE_FORMAT
                                  )
                                : '',
                        },
                    }),
                nonRegTypeReason: selectedRegReasons,
            };
        });
    }, [
        isTitlePresent,
        qualType,
        isMultipleQualType,
        isSignValid,
        isLoaAttached,
        isValidOwnerRegType,
        selectedRegReasons,
        loaSignDate,
    ]);

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <Typography
                variant={TypographyVariant.H3}
                className="mb-4"
                data-testid="title"
            >
                {t('cedingCompanySignature.title')}
            </Typography>

            <Autocomplete
                className="max-w-lg"
                label={t('cedingCompanySignature.qualType') as string}
                options={qualificationOptions}
                onChange={(val: string) => setQualType(val as QualTypes)}
                size={FieldSize.Small}
                value={qualType}
                data-testid="accountType"
                disabled={isFormStateReadOnly}
                variant={
                    isFormStateReadOnly
                        ? FieldVariant.Inactive
                        : FieldVariant.Default
                }
            />

            <div className="my-4 flex flex-wrap gap-8 max-md:flex-col">
                <CheckboxText
                    label={t('cedingCompanySignature.isQualTypeNotValid')}
                    checked={isMultipleQualType}
                    onChange={() => setIsMultipleQualType(!isMultipleQualType)}
                    isDisabled={isFormStateReadOnly}
                />
            </div>

            <div className="my-4 flex flex-wrap gap-8">
                {renderCorporateResolution && (
                    <SelectValidButtonGroup
                        options={validButtonGroupOptions}
                        isValid={isSignValid}
                        setIsValid={setIsSignValid}
                        label={
                            authorizedSignatureLabel ||
                            (t(
                                'cedingCompanySignature.isSignatureValid'
                            ) as string)
                        }
                        disabled={isFormStateReadOnly}
                    />
                )}

                {renderIsTitlePresent && (
                    <SelectValidButtonGroup
                        options={validButtonGroupOptions}
                        isValid={isTitlePresent}
                        setIsValid={setIsTitlePresent}
                        label={
                            t('cedingCompanySignature.isTitlePresent') as string
                        }
                        disabled={isFormStateReadOnly}
                    />
                )}

                {renderIsLoaAttached && (
                    <SelectValidButtonGroup
                        options={validButtonGroupOptions}
                        isValid={isLoaAttached}
                        setIsValid={setIsLoaAttached}
                        disabled={isFormStateReadOnly}
                        label={
                            t('cedingCompanySignature.isLoaAttached') as string
                        }
                    />
                )}

                {renderIsLoaAttached &&
                    renderLoaDate &&
                    deStringifyTrueFalseNull(isLoaAttached) && (
                        <div className="self-end">
                            <FieldDateSelect
                                id="loa-date"
                                isFutureDateDisabled={false}
                                onChange={(e) => {
                                    setLoaSignDate(e.target.value);
                                }}
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={loaSignDate}
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

            <div className="my-4 grid grid-cols-2 gap-10">
                <SelectValidButtonGroup
                    options={yesNoButtonGroupOptions}
                    isValid={isValidOwnerRegType}
                    disabled={isFormStateReadOnly}
                    setIsValid={setIsValidOwnerRegType}
                    label={
                        t('cedingCompanySignature.validOwnerRegType') as string
                    }
                />
            </div>

            {deStringifyTrueFalseNull(isValidOwnerRegType) === false && (
                <div className="flex flex-col gap-4">
                    {invalidOwnerRegReasons.map(({ label, value }) => {
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

export default CedingCompanyDistribution;
