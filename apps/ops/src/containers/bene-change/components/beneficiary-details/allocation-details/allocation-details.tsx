import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import xss from 'xss';

import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';

import { BeneRelationshipToInsured } from './allocation-details.helper';

interface AllocationDetailsProps {
    updateAllocation: any;
    setAllocationDetails: Dispatch<SetStateAction<any>>;
    isReadOnly?: boolean;
};

const INITIAL_ALLOCATION = {
    beneficiaryPercentage: '',
    relationshipToInsured: '',
}
export default function AllocationDetails({updateAllocation, setAllocationDetails, isReadOnly}: AllocationDetailsProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'beneChange.beneDetails.allocation' });

    const relationshipToInsuredOptions = [
        { label: t('relationshipToInsured.associate'), value: BeneRelationshipToInsured.ASSOCIATE },
        { label: t('relationshipToInsured.aunt'), value: BeneRelationshipToInsured.AUNT },
        { label: t('relationshipToInsured.brother'), value: BeneRelationshipToInsured.BROTHER },
        { label: t('relationshipToInsured.daughter'), value: BeneRelationshipToInsured.DAUGHTER },
        { label: t('relationshipToInsured.father'), value: BeneRelationshipToInsured.FATHER },
        { label: t('relationshipToInsured.fiance'), value: BeneRelationshipToInsured.FIANCE },
        { label: t('relationshipToInsured.grandfather'), value: BeneRelationshipToInsured.GRANDFATHER },
        { label: t('relationshipToInsured.grandmother'), value: BeneRelationshipToInsured.GRANDMOTHER },
        { label: t('relationshipToInsured.grandchild'), value: BeneRelationshipToInsured.GRANDCHILD },
        { label: t('relationshipToInsured.husband'), value: BeneRelationshipToInsured.HUSBAND },
        { label: t('relationshipToInsured.mother'), value: BeneRelationshipToInsured.MOTHER },
        { label: t('relationshipToInsured.partner'), value: BeneRelationshipToInsured.PARTNER },
        { label: t('relationshipToInsured.sister'), value: BeneRelationshipToInsured.SISTER },
        { label: t('relationshipToInsured.son'), value: BeneRelationshipToInsured.SON },
        { label: t('relationshipToInsured.trustee'), value: BeneRelationshipToInsured.TRUSTEE },
        { label: t('relationshipToInsured.wife'), value: BeneRelationshipToInsured.WIFE },
        { label: t('relationshipToInsured.uncle'), value: BeneRelationshipToInsured.UNCLE },
        { label: t('relationshipToInsured.niece'), value: BeneRelationshipToInsured.NIECE },
        { label: t('relationshipToInsured.nephew'), value: BeneRelationshipToInsured.NEPHEW },
        { label: t('relationshipToInsured.self'), value: BeneRelationshipToInsured.SELF },
        { label: t('relationshipToInsured.estate'), value: BeneRelationshipToInsured.ESTATE },
        { label: t('relationshipToInsured.trust'), value: BeneRelationshipToInsured.TRUST },
        { label: t('relationshipToInsured.spouse'), value: BeneRelationshipToInsured.SPOUSE },
        { label: t('relationshipToInsured.grandson'), value: BeneRelationshipToInsured.GRANDSON },
        { label: t('relationshipToInsured.granddaughter'), value: BeneRelationshipToInsured.GRANDDAUGHTER },
        { label: t('relationshipToInsured.parent'), value: BeneRelationshipToInsured.PARENT },
        { label: t('relationshipToInsured.child'), value: BeneRelationshipToInsured.CHILD },
        { label: t('relationshipToInsured.nonSpouse'), value: BeneRelationshipToInsured.NONSPOUSE },
        { label: t('relationshipToInsured.childrenEqually'), value: BeneRelationshipToInsured.CHILDRENEQUALLY },
        { label: t('relationshipToInsured.childrenPerStirpes'), value: BeneRelationshipToInsured.CHILDRENPERSTIRPES },
        { label: t('relationshipToInsured.perStirpes'), value: BeneRelationshipToInsured.PERSTIRPES },
        { label: t('relationshipToInsured.survivingSpouse'), value: BeneRelationshipToInsured.SURVIVINGSPOUSE },
        { label: t('relationshipToInsured.other'), value: BeneRelationshipToInsured.OTHER },
    ];

    const [allocation, setAllocation] = useState(updateAllocation ?? INITIAL_ALLOCATION);

    const setBeneficiaryPercentage = (e: any) => {
        let currentValue = Number(xss(e?.target?.value));
        setAllocation((prevState: any) => {
            if (prevState === 0) {
                currentValue = Number(String(currentValue)[0]);
            }
            return { ...prevState, beneficiaryPercentage: currentValue };
        })
    };

    useEffect(() => {
        setAllocationDetails((prevState: any) => ({ ...prevState, ...allocation }));
    }, [allocation, setAllocationDetails]);

    return (
        <>
            <div className="mb-3 grid w-full grid-cols-6">
                <Field
                    aria-labelledby={'allocationField'}
                    formatOptions={{
                        format: '',
                        type: 'number',
                        decimalPlaces: 2,
                    }}
                    label={t('labels.allocation') as string}
                    min={0}
                    max={100}
                    onChange={event => setBeneficiaryPercentage(event)}
                    onBlur={() => {}}
                    value={allocation.beneficiaryPercentage}
                    size={FieldSize.Small}
                    trailing={<div className="">%</div>}
                    type={FieldType.BaseActive}
                    variant={isReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                />
            </div>

            <div className="mb-3 grid w-full grid-cols-4">
                <SelectSimple
                    label={t('labels.relationshipToInsured') as string}
                    onChange={value => setAllocation((prevState: any) => ({ ...prevState, relationshipToInsured: value }))}
                    options={relationshipToInsuredOptions}
                    value={allocation.relationshipToInsured}
                    disabled={isReadOnly}
                />
            </div>
        </>
    );
}
