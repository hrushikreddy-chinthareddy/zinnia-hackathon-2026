import { useState } from 'react';

import CardContainer from '@deps/containers/card-container/card-container';

import ButtonGrp from '../button-group/button-group';
import InputCheckBox from '../checkbox-v2/input-checkbox';
import { FieldSize, FieldType } from '../fields/field';
import FieldDateSelect from '../fields/field-date-select/field-date-select';
import Label, { LabelVariant } from '../label/label';

const BeneficiaryInfo = () => {
    const [showBeneficiaryInfo, setShowBeneficiaryInfo] = useState<boolean>(false);
    const beneficiaryConfirmationOption = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' },
    ];
    return (
        <CardContainer containerClassNames={`border-b-2 border-gray-100`}>
            <div className="flex items-center mb-5">
                <InputCheckBox
                    checked={showBeneficiaryInfo}
                    onChange={() => {
                        setShowBeneficiaryInfo(!showBeneficiaryInfo);
                    }}
                />
                <Label label={'Beneficiary Information'} variant={LabelVariant.LabelLg} className="mx-3" />
            </div>
            <div className="my-3">
                <Label label={'Is your beneficiary your spouse ?'} variant={LabelVariant.LabelLg} />
                <ButtonGrp
                    activeValue={'Yes'}
                    groupLabel=""
                    toggle={() => {}}
                    labels={beneficiaryConfirmationOption}
                    disabled={false}
                    className="my-3"
                    size="lg"
                />
            </div>
            <div className="my-3">
                <Label label={'Is your spouse 10 year younger than you ?'} variant={LabelVariant.LabelLg} className="mb-3" />
                <div className="grid grid-cols-6">
                    <FieldDateSelect
                        isFutureDateDisabled={false}
                        label={'Date of birth'}
                        onChange={() => {}}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={''}
                        // disabled={isFormStateReadOnly}
                        // variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                    />
                </div>
            </div>
        </CardContainer>
    );
};

export default BeneficiaryInfo;
