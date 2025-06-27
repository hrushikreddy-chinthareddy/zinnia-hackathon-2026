import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useState, useContext, useEffect } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldDateSelect, {
    DATE_PICKER_FORMAT,
} from '@deps/components/fields/field-date-select/field-date-select';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { RMD } from '@deps/models/case/withdrawal/case';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { IFieldConfig } from '../form-party/form-party';
import { PartyFields } from '../form-party/party-helpers';

interface JLEFieldConfig {
    fieldName: PartyFields;
    fieldLabel: string;
}

const DEFAULT_LIFE_EXPECTANCY = {
    firstName: null,
    middleName: null,
    lastName: null,
    dob: { text: null },
    taxId: { text: null },
};

export interface JointLifeExpectancyConfig {
    title?: string;
    checkboxLabel: string;
    fields: {
        fieldName: PartyFields;
        fieldLabel: string;
    }[];
}
export function useJLEFields({
    firstName: ogFirst,
    middleName: ogMiddle,
    lastName: ogLast,
    dob: ogDob,
    taxId: ogTaxId,
}: JointLifeExpectancy) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.personalDetails',
    });

    const formDob = ogDob?.text
        ? dayjs(ogDob?.text, ZAHARA_API_DATE_FORMAT).format(DATE_PICKER_FORMAT)
        : '';
    const ssnFormat = { format: '#########' };

    const [firstName, setFirstName] = useState(ogFirst || '');
    const [middleName, setMiddleName] = useState(ogMiddle || '');
    const [lastName, setLastName] = useState(ogLast || '');
    const [dob, setDob] = useState(formDob || '');
    const [taxId, setTaxId] = useState(ogTaxId?.text || '');

    const firstNameField = ({ label, isFormStateReadOnly }: IFieldConfig) => (
        <Field
            label={label || (t(`firstName`) as string)}
            onChange={(e) => setFirstName(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={firstName}
            variant={
                isFormStateReadOnly
                    ? FieldVariant.Inactive
                    : FieldVariant.Default
            }
            data-testid="first-name-test-id"
        />
    );

    const middleNameField = ({ label, isFormStateReadOnly }: IFieldConfig) => (
        <Field
            label={label || (t(`middleName`) as string)}
            onChange={(e) => setMiddleName(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={middleName}
            variant={
                isFormStateReadOnly
                    ? FieldVariant.Inactive
                    : FieldVariant.Default
            }
            data-testid="middle-name-test-id"
        />
    );

    const lastNameField = ({ label, isFormStateReadOnly }: IFieldConfig) => (
        <Field
            label={label || (t(`lastName`) as string)}
            onChange={(e) => setLastName(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={lastName}
            variant={
                isFormStateReadOnly
                    ? FieldVariant.Inactive
                    : FieldVariant.Default
            }
            data-testid="last-name-test-id"
        />
    );

    const dobField = ({ label, isFormStateReadOnly }: IFieldConfig) => (
        <FieldDateSelect
            label={label || (t(`dob`) as string)}
            onChange={(e) => setDob(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={dob}
            data-testid="dob-test-id"
            disabled={isFormStateReadOnly}
            variant={
                isFormStateReadOnly
                    ? FieldVariant.Inactive
                    : FieldVariant.Default
            }
        />
    );

    const taxIdField = ({ label, isFormStateReadOnly }: IFieldConfig) => (
        <Field
            label={label || (t(`ssn`) as string)}
            formatOptions={ssnFormat}
            onChange={(e) => setTaxId(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={taxId}
            data-testid="tax-id-test-id"
            disabled={isFormStateReadOnly}
        />
    );

    const renderField = (
        field: JLEFieldConfig,
        isFormStateReadOnly: boolean
    ): JSX.Element | null => {
        switch (field.fieldName) {
            case PartyFields.FirstName:
                return (
                    <div key={field.fieldName}>
                        {firstNameField({
                            label: field.fieldLabel,
                            isFormStateReadOnly,
                        })}
                    </div>
                );
            case PartyFields.MiddleName:
                return (
                    <div key={field.fieldName}>
                        {middleNameField({
                            label: field.fieldLabel,
                            isFormStateReadOnly,
                        })}
                    </div>
                );
            case PartyFields.LastName:
                return (
                    <div key={field.fieldName}>
                        {lastNameField({
                            label: field.fieldLabel,
                            isFormStateReadOnly,
                        })}
                    </div>
                );
            case PartyFields.Dob:
                return (
                    <div key={field.fieldName}>
                        {dobField({
                            label: field.fieldLabel,
                            isFormStateReadOnly,
                        })}
                    </div>
                );
            case PartyFields.TaxId:
                return (
                    <div key={field.fieldName}>
                        {taxIdField({
                            label: field.fieldLabel,
                            isFormStateReadOnly,
                        })}
                    </div>
                );

            default:
                return null;
        }
    };

    return {
        renderField,
        firstName,
        middleName,
        lastName,
        dob: {
            text: dob
                ? dayjs(dob, DATE_PICKER_FORMAT).format(ZAHARA_API_DATE_FORMAT)
                : '',
        },
        taxId: { text: taxId },
    };
}

type JointLifeExpectancy = Pick<
    RMD,
    'firstName' | 'middleName' | 'lastName' | 'dob' | 'taxId'
>;

export interface JointLifeExpectancyProps {
    configs: JointLifeExpectancyConfig;
    isFormStateReadOnly?: boolean;
}
export default function JointLifeExpectancy({
    configs,
    isFormStateReadOnly = false,
}: JointLifeExpectancyProps) {
    const { formProgram, setFormProgram } = useContext(FormDataContext);
    const [isJointLifeExpectancy, setisJointLifeExpectancy] = useState(
        formProgram?.rmd?.isJointLifeExpectancy || false
    );
    const { renderField, firstName, middleName, lastName, dob, taxId } =
        useJLEFields(formProgram?.rmd || DEFAULT_LIFE_EXPECTANCY);

    useEffect(() => {
        // reset to default when isJointLifeExpectancy is false
        const jointLifeExpectancy = isJointLifeExpectancy
            ? { firstName, middleName, lastName, dob, taxId }
            : DEFAULT_LIFE_EXPECTANCY;

        setFormProgram((ogFp) => {
            return {
                ...ogFp,
                rmd: {
                    ...(ogFp.rmd as RMD), // FormProgram's RMD is handled in a separate form part.  If Joint Life exists, so must RMD
                    ...jointLifeExpectancy,
                    isJointLifeExpectancy: isJointLifeExpectancy,
                },
            };
        });
    }, [
        isJointLifeExpectancy,
        firstName,
        middleName,
        lastName,
        dob?.text,
        taxId?.text,
    ]);

    return (
        <CardContainer
            containerClassNames="border-b-2 border-gray-100"
            classNames="w-full"
        >
            {configs.title && (
                <Typography variant={TypographyVariant.H3} className="my-4">
                    {configs.title}
                </Typography>
            )}
            <div className="flex flex-wrap gap-8 max-md:flex-col">
                <div className="flex-1">
                    <CheckboxText
                        label={configs.checkboxLabel}
                        isDisabled={isFormStateReadOnly}
                        checked={isJointLifeExpectancy}
                        onChange={() => {
                            setisJointLifeExpectancy(!isJointLifeExpectancy);
                        }}
                        data-testid="is-joint-life-expectancy-test-id"
                    />
                </div>
            </div>

            {isJointLifeExpectancy && (
                <div className="my-4 grid grid-cols-5 gap-2">
                    {configs.fields?.map((field) =>
                        renderField(field, isFormStateReadOnly)
                    )}
                </div>
            )}
        </CardContainer>
    );
}
