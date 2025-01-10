import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import CardContainer from '@deps/containers/card-container/card-container';
import { stringifyTrueFalseNull } from '@deps/helpers/string.helper';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import ButtonGrp from '../button-group/button-group';
import InputCheckBox from '../checkbox-v2/input-checkbox';
import { FieldSize, FieldType, FieldVariant } from '../fields/field';
import FieldDateSelect, { DATE_PICKER_FORMAT } from '../fields/field-date-select/field-date-select';
import Label, { LabelVariant } from '../label/label';

export type FormBeneInfo = {
    spouseDOB?: string;
    isBeneInfoProvided?: boolean;
    isBeneSpouse?: boolean;
};

interface BeneficiaryInfoProps {
    isFormStateReadOnly: boolean;
    beneInfo: FormBeneInfo | null;
    onBeneChange: (info: FormBeneInfo) => void;
    isBeneSpouseOption: { label: string; value: string }[];
}

const BeneficiaryInfo: React.FC<BeneficiaryInfoProps> = ({ isFormStateReadOnly, beneInfo, onBeneChange, isBeneSpouseOption }) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });

    const formattedDate = beneInfo?.spouseDOB ? dayjs(beneInfo.spouseDOB, ZAHARA_API_DATE_FORMAT).format(DATE_PICKER_FORMAT) : '';
    const [bornDate, setBornDate] = useState(formattedDate);

    useEffect(() => {
        if (dayjs(bornDate, DATE_PICKER_FORMAT).isValid()) {
            setBornDate(bornDate);
            onBeneChange({
                ...beneInfo,
                spouseDOB: dayjs(bornDate, DATE_PICKER_FORMAT).format(ZAHARA_API_DATE_FORMAT),
            });
        }
    }, [bornDate]);

    return (
        <CardContainer containerClassNames={`border-b-2 border-gray-100`}>
            <div className="flex items-center mb-5">
                <InputCheckBox
                    checked={beneInfo?.isBeneInfoProvided || false}
                    onChange={() =>
                        onBeneChange({
                            ...beneInfo,
                            isBeneInfoProvided: !beneInfo?.isBeneInfoProvided,
                        })
                    }
                />
                <Label label={t('beneficiaryInfo.title')} variant={LabelVariant.LabelLg} className="mx-3" />
            </div>
            {beneInfo?.isBeneInfoProvided && (
                <>
                    <div className="my-3">
                        <Label label={t('beneficiaryInfo.isBeneficiarySpouse.title')} variant={LabelVariant.LabelSm} />
                        <ButtonGrp
                            activeValue={stringifyTrueFalseNull(beneInfo?.isBeneSpouse) || stringifyTrueFalseNull(false)}
                            toggle={() =>
                                onBeneChange({
                                    ...beneInfo,
                                    isBeneSpouse: !beneInfo?.isBeneSpouse,
                                })
                            }
                            labels={isBeneSpouseOption}
                            disabled={false}
                            className="my-3"
                            size="lg"
                        />
                    </div>
                    <div className="my-3">
                        <Label
                            label={'Is your spouse 10 year younger than you ?'}
                            variant={LabelVariant.LabelSm}
                            className="mb-3 font-bold font-primary"
                        />
                        <div className="grid grid-cols-6">
                            <FieldDateSelect
                                isFutureDateDisabled={false}
                                label={t('beneficiaryInfo.dob') as string}
                                onChange={e => {
                                    setBornDate(e.target.value);
                                }}
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={bornDate}
                                disabled={isFormStateReadOnly}
                                variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                            />
                        </div>
                    </div>
                </>
            )}
        </CardContainer>
    );
};

export default BeneficiaryInfo;
