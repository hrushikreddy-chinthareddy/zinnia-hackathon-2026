import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import xss from 'xss';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';

import { BeneRelationshipToInsured } from './allocation-details.helpers';

interface AllocationDetailsProps {
    updateAllocation: any;
    setAllocationDetails: Dispatch<SetStateAction<any>>;
    isReadOnly?: boolean;
}

const INITIAL_ALLOCATION = {
    beneficiaryPercentage: '',
    relationshipToInsured: '',
};

export default function AllocationDetails({
    updateAllocation,
    setAllocationDetails,
    isReadOnly,
}: AllocationDetailsProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'beneChange.beneDetails.allocation',
    });

    const relationshipToPartyOptions = [
        {
            label: t('relationshipToInsured.trustee'),
            value: BeneRelationshipToInsured.TRUSTEE,
        },
        {
            label: t('relationshipToInsured.trusteeOfMinor'),
            value: BeneRelationshipToInsured.TRUSTEEOFMINOR,
        },
        {
            label: t('relationshipToInsured.trusteeOfIncompetent'),
            value: BeneRelationshipToInsured.TRUSTEEOFINCOMPETENT,
        },
        {
            label: t('relationshipToInsured.powerOfAttorney'),
            value: BeneRelationshipToInsured.POWEROFATTORNEY,
        },
        {
            label: t('relationshipToInsured.controllingPersonOfEntity'),
            value: BeneRelationshipToInsured.CONTROLLINGPERSONOFENTITY,
        },
        {
            label: t('relationshipToInsured.brother'),
            value: BeneRelationshipToInsured.BROTHER,
        },
        {
            label: t('relationshipToInsured.child'),
            value: BeneRelationshipToInsured.CHILD,
        },
        {
            label: t('relationshipToInsured.daughter'),
            value: BeneRelationshipToInsured.DAUGHTER,
        },
        {
            label: t('relationshipToInsured.domesticPartner'),
            value: BeneRelationshipToInsured.DOMESTICPARTNER,
        },
        {
            label: t('relationshipToInsured.executor'),
            value: BeneRelationshipToInsured.EXECUTOR,
        },
        {
            label: t('relationshipToInsured.father'),
            value: BeneRelationshipToInsured.FATHER,
        },
        {
            label: t('relationshipToInsured.fiance'),
            value: BeneRelationshipToInsured.FIANCE,
        },
        {
            label: t('relationshipToInsured.grandchild'),
            value: BeneRelationshipToInsured.GRANDCHILD,
        },
        {
            label: t('relationshipToInsured.lifePartner'),
            value: BeneRelationshipToInsured.LIFEPARTNER,
        },
        {
            label: t('relationshipToInsured.mother'),
            value: BeneRelationshipToInsured.MOTHER,
        },
        {
            label: t('relationshipToInsured.sister'),
            value: BeneRelationshipToInsured.SISTER,
        },
        {
            label: t('relationshipToInsured.son'),
            value: BeneRelationshipToInsured.SON,
        },
        {
            label: t('relationshipToInsured.spouse'),
            value: BeneRelationshipToInsured.SPOUSE,
        },
        {
            label: t('relationshipToInsured.stepfather'),
            value: BeneRelationshipToInsured.STEPFATHER,
        },
        {
            label: t('relationshipToInsured.stepmother'),
            value: BeneRelationshipToInsured.STEPMOTHER,
        },
        {
            label: t('relationshipToInsured.self'),
            value: BeneRelationshipToInsured.SELF,
        },
        {
            label: t('relationshipToInsured.business'),
            value: BeneRelationshipToInsured.BUSINESS,
        },
        {
            label: t('relationshipToInsured.businessAssociate'),
            value: BeneRelationshipToInsured.BUSINESSASSOCIATE,
        },
        {
            label: t('relationshipToInsured.partner'),
            value: BeneRelationshipToInsured.PARTNER,
        },
        {
            label: t('relationshipToInsured.employer'),
            value: BeneRelationshipToInsured.EMPLOYER,
        },
        {
            label: t('relationshipToInsured.formerSpouse'),
            value: BeneRelationshipToInsured.FORMERSPOUSE,
        },
        {
            label: t('relationshipToInsured.grandparent'),
            value: BeneRelationshipToInsured.GRANDPARENT,
        },
        {
            label: t('relationshipToInsured.parent'),
            value: BeneRelationshipToInsured.PARENT,
        },
        {
            label: t('relationshipToInsured.owner'),
            value: BeneRelationshipToInsured.OWNER,
        },
        {
            label: t('relationshipToInsured.sibling'),
            value: BeneRelationshipToInsured.SIBLING,
        },
        {
            label: t('relationshipToInsured.stepchild'),
            value: BeneRelationshipToInsured.STEPCHILD,
        },
        {
            label: t('relationshipToInsured.stepparent'),
            value: BeneRelationshipToInsured.STEPPARENT,
        },
        {
            label: t('relationshipToInsured.other'),
            value: BeneRelationshipToInsured.OTHER,
        },
    ];

    const [allocation, setAllocation] = useState(
        updateAllocation ?? INITIAL_ALLOCATION
    );
    const [currentErrors, setCurrentErrors] = useState<any>();

    const setBeneficiaryPercentage = (e: any) => {
        let currentValue = Number(xss(e?.target?.value));
        setAllocation((prevState: any) => {
            if (prevState === 0) {
                currentValue = Number(String(currentValue)[0]);
            }
            return { ...prevState, beneficiaryPercentage: currentValue };
        });

        if (!(Number(currentValue) > 0)) {
            setCurrentErrors((prevState: any) => ({
                ...prevState,
                beneficiaryPercentage: t('allocationRequired'),
            }));
        } else {
            setCurrentErrors({});
        }
    };

    useEffect(() => {
        setAllocationDetails((prevState: any) => ({
            ...prevState,
            ...allocation,
        }));
    }, [allocation, setAllocationDetails]);

    const relationshipError =
        !allocation.relationshipToParty && !isReadOnly
            ? t('relationshipToParty')
            : '';

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
                    onChange={(event) => setBeneficiaryPercentage(event)}
                    onBlur={() => {}}
                    value={allocation.beneficiaryPercentage}
                    size={FieldSize.Small}
                    trailing={<div className="">%</div>}
                    type={FieldType.BaseActive}
                    variant={
                        isReadOnly
                            ? FieldVariant.Inactive
                            : currentErrors?.beneficiaryPercentage
                            ? FieldVariant.Error
                            : FieldVariant.Default
                    }
                    message={currentErrors?.beneficiaryPercentage}
                    required={true}
                />
            </div>

            <div className="mb-3 grid w-full grid-cols-4">
                <SelectSimple
                    label={t('labels.relationshipToParty') as string}
                    onChange={(value) =>
                        setAllocation((prevState: any) => ({
                            ...prevState,
                            relationshipToParty: value,
                        }))
                    }
                    options={relationshipToPartyOptions}
                    value={allocation.relationshipToParty}
                    disabled={isReadOnly}
                    required={true}
                    message={relationshipError}
                    variant={
                        isReadOnly
                            ? FieldVariant.Inactive
                            : relationshipError
                            ? FieldVariant.Error
                            : FieldVariant.Default
                    }
                />
            </div>
        </>
    );
}
