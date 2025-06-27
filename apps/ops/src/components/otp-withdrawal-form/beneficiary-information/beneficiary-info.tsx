import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import ButtonGroup from '@deps/components/button-group/button-group';
import InputCheckBox from '@deps/components/checkbox-v2/input-checkbox';
import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldDateSelect, {
    DATE_PICKER_FORMAT,
} from '@deps/components/fields/field-date-select/field-date-select';
import Label, { LabelVariant } from '@deps/components/label/label';
import CardContainer from '@deps/containers/card-container/card-container';
import { stringifyTrueFalseNull } from '@deps/helpers/string.helpers';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { IFieldConfig } from '../form-party/form-party';
import { PartyFields } from '../form-party/party-helpers';

export type FormBeneInfo = {
    spouseDOB: string | null;
    isBeneInfoProvided: boolean;
    isBeneSpouse: boolean;
    spouseFirstName: string | null;
    spouseMiddleName: string | null;
    spouseLastName: string | null;
    spouseSSN: string | null;
};

export interface BeneficiaryConfig {
    isYourSpouseYoungerThanYouLabel?: string | null;
    isBeneficiarySpouseTitle?: string | null;
    fields: {
        fieldName: PartyFields;
        fieldLabel: string;
    }[];
}

interface BeneficiaryInfoProps {
    isFormStateReadOnly: boolean;
    beneInfo: FormBeneInfo | null;
    onBeneChange: (info: FormBeneInfo) => void;
    isBeneSpouseOption: { label: string; value: string }[];
    configs: BeneficiaryConfig;
}

interface JLEFieldConfig {
    fieldName: PartyFields;
    fieldLabel: string;
}

const DEFAULT_BENEFICIARY = {
    spouseFirstName: null,
    spouseMiddleName: null,
    spouseLastName: null,
    spouseDOB: null,
    spouseSSN: null,
    isBeneSpouse: false,
    isBeneInfoProvided: false,
};

type BeneficiaryInfoFields = Pick<
    FormBeneInfo,
    | 'spouseFirstName'
    | 'spouseMiddleName'
    | 'spouseLastName'
    | 'spouseDOB'
    | 'spouseSSN'
>;

export function useJLEFields({
    spouseFirstName: ogFirst,
    spouseMiddleName: ogMiddle,
    spouseLastName: ogLast,
    spouseDOB: ogDob,
    spouseSSN: ogTaxId,
}: BeneficiaryInfoFields) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.personalDetails',
    });

    const formDob = ogDob
        ? dayjs(ogDob, ZAHARA_API_DATE_FORMAT).format(DATE_PICKER_FORMAT)
        : '';
    const ssnFormat = { format: '#########' };

    const [spouseFirstName, setSpouseFirstName] = useState(ogFirst || '');
    const [spouseMiddleName, setSpouseMiddleName] = useState(ogMiddle || '');
    const [spouseLastName, setSpouseLastName] = useState(ogLast || '');
    const [spouseDOB, setSpouseDOB] = useState(formDob || '');
    const [spouseSSN, setSpouseSSN] = useState(ogTaxId || '');

    const firstNameField = ({ label, isFormStateReadOnly }: IFieldConfig) => (
        <Field
            label={label || (t(`spouseFirstName`) as string)}
            onChange={(e) => setSpouseFirstName(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={spouseFirstName}
            variant={
                isFormStateReadOnly
                    ? FieldVariant.Inactive
                    : FieldVariant.Default
            }
            data-testid="spouseFirstName-test-id"
        />
    );

    const middleNameField = ({ label, isFormStateReadOnly }: IFieldConfig) => (
        <Field
            label={label || (t(`spouseMiddleName`) as string)}
            onChange={(e) => setSpouseMiddleName(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={spouseMiddleName}
            variant={
                isFormStateReadOnly
                    ? FieldVariant.Inactive
                    : FieldVariant.Default
            }
            data-testid="spouseMiddleName-test-id"
        />
    );

    const lastNameField = ({ label, isFormStateReadOnly }: IFieldConfig) => (
        <Field
            label={label || (t(`spouseLastName`) as string)}
            onChange={(e) => setSpouseLastName(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={spouseLastName}
            variant={
                isFormStateReadOnly
                    ? FieldVariant.Inactive
                    : FieldVariant.Default
            }
            data-testid="spouseLastName-test-id"
        />
    );

    const dobField = ({ label, isFormStateReadOnly }: IFieldConfig) => (
        <FieldDateSelect
            label={label || (t(`spouseDOB`) as string)}
            onChange={(e) => setSpouseDOB(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={spouseDOB}
            data-testid="spouseDOB-test-id"
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
            onChange={(e) => setSpouseSSN(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={spouseSSN}
            data-testid="spouseSSN-test-id"
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
        spouseFirstName,
        spouseMiddleName,
        spouseLastName,
        spouseDOB: spouseDOB
            ? dayjs(spouseDOB, DATE_PICKER_FORMAT).format(
                  ZAHARA_API_DATE_FORMAT
              )
            : '',
        spouseSSN: spouseSSN,
    };
}

const BeneficiaryInfo: React.FC<BeneficiaryInfoProps> = ({
    isFormStateReadOnly,
    beneInfo,
    onBeneChange,
    isBeneSpouseOption,
    configs,
}: BeneficiaryInfoProps) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request',
    });
    const {
        renderField,
        spouseFirstName,
        spouseMiddleName,
        spouseLastName,
        spouseDOB,
        spouseSSN,
    } = useJLEFields(beneInfo || DEFAULT_BENEFICIARY);

    useEffect(() => {
        const info =
            beneInfo && beneInfo?.isBeneSpouse
                ? {
                      spouseFirstName,
                      spouseMiddleName,
                      spouseLastName,
                      spouseDOB,
                      spouseSSN,
                      isBeneSpouse: beneInfo?.isBeneSpouse || false,
                      isBeneInfoProvided: beneInfo?.isBeneInfoProvided || false,
                  }
                : {
                      ...DEFAULT_BENEFICIARY,
                      isBeneInfoProvided: beneInfo?.isBeneInfoProvided || false,
                  };
        onBeneChange(info);
    }, [
        beneInfo?.isBeneSpouse,
        spouseFirstName,
        spouseMiddleName,
        spouseLastName,
        spouseDOB,
        spouseSSN,
    ]);

    const handleBeneChange = (isBeneInfoProvided: boolean) => {
        const info = isBeneInfoProvided
            ? {
                  spouseFirstName,
                  spouseMiddleName,
                  spouseLastName,
                  spouseDOB,
                  spouseSSN,
                  isBeneSpouse: beneInfo?.isBeneSpouse || false,
                  isBeneInfoProvided: isBeneInfoProvided,
              }
            : DEFAULT_BENEFICIARY;
        onBeneChange(info);
    };

    const handleButtonClick = (isBeneSpouse: string) => {
        const info =
            isBeneSpouse === 'true'
                ? {
                      spouseFirstName,
                      spouseMiddleName,
                      spouseLastName,
                      spouseDOB,
                      spouseSSN,
                      isBeneSpouse: isBeneSpouse === 'true',
                      isBeneInfoProvided: beneInfo?.isBeneInfoProvided || false,
                  }
                : {
                      ...DEFAULT_BENEFICIARY,
                      isBeneInfoProvided: beneInfo?.isBeneInfoProvided || false,
                  };
        onBeneChange(info);
    };

    return (
        <CardContainer containerClassNames={`border-b-2 border-gray-100`}>
            <div className="flex items-center mb-5">
                <InputCheckBox
                    checked={beneInfo?.isBeneInfoProvided || false}
                    onChange={(e) =>
                        handleBeneChange(!beneInfo?.isBeneInfoProvided)
                    }
                    isDisabled={isFormStateReadOnly}
                />
                <Label
                    label={t('beneficiaryInfo.title')}
                    variant={LabelVariant.FieldLabel}
                    className="mx-3"
                />
            </div>
            {beneInfo?.isBeneInfoProvided && (
                <>
                    <div className="my-3">
                        <Label
                            label={
                                configs.isBeneficiarySpouseTitle ||
                                t('beneficiaryInfo.isBeneficiarySpouse.title')
                            }
                            variant={LabelVariant.FieldLabel}
                        />
                        <ButtonGroup
                            activeValue={
                                beneInfo?.isBeneInfoProvided
                                    ? stringifyTrueFalseNull(
                                          beneInfo?.isBeneSpouse
                                      )
                                    : stringifyTrueFalseNull(false)
                            }
                            toggle={(value) => handleButtonClick(value)}
                            labels={isBeneSpouseOption}
                            disabled={isFormStateReadOnly}
                            variant={'primary'}
                            className="my-3"
                            size={'xxs'}
                        />
                    </div>

                    {beneInfo?.isBeneSpouse &&
                        configs?.isYourSpouseYoungerThanYouLabel && (
                            <div className="my-3">
                                <Label
                                    label={t(
                                        'beneficiaryInfo.isYourSpouseYoungerThanYou'
                                    )}
                                    variant={LabelVariant.FieldLabel}
                                />
                            </div>
                        )}
                    {beneInfo?.isBeneSpouse && (
                        <div className="my-4 grid grid-cols-5 gap-2">
                            {configs?.fields?.map((field) =>
                                renderField(field, isFormStateReadOnly)
                            )}
                        </div>
                    )}
                </>
            )}
        </CardContainer>
    );
};

export default BeneficiaryInfo;
