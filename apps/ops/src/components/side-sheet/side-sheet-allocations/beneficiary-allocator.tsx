import { PartyRole } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import xss from 'xss';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import Content, { ContentVariant } from '@deps/components/content/content';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';

import AllocationField from './allocation-field';
import {
    AllocationPercentage,
    Beneficiary,
    BennyPercent,
    calculateTotalPercent,
    convertBenefitPercentagesToAllocationPercentages,
    getBeneficiariesByFocusedParty,
} from './side-sheet-allocations-helpers';

export interface BeneficiaryAllocatorProps {
    beneficiaries: Beneficiary[];
    className?: string;
    focusedPartyId?: string; // Used to pull this beneficiary to the top of the list
    partyRole?: PartyRole;
    onChange: (percentages: AllocationPercentage[], isValid: boolean) => void;
    needsValidation: boolean; // Should validation errors be shown?
}

const BeneficiaryAllocator: React.FC<BeneficiaryAllocatorProps> = ({
    beneficiaries,
    className = '',
    focusedPartyId,
    partyRole,
    onChange,
    needsValidation = false,
}) => {
    const { t } = useTranslation();

    const [benefitPercentages, setBenefitPercentages] = useState(
        beneficiaries.reduce((acc, { beneficiaryPercentage, partyId }) => {
            acc[partyId as string] = Number(beneficiaryPercentage);
            return acc;
        }, {} as BennyPercent)
    );

    const [shouldValidate, setShouldValidate] = useState(false);
    const [totalPercent, setTotalPercent] = useState(100);
    const [error, setError] = useState({ hasError: false, failedValidation: false, message: '' });

    const setBeneficiaryPercentage = (partyId: string | undefined) => (e: any) => {
        setBenefitPercentages((prevState: BennyPercent): BennyPercent => {
            const prevValue = prevState[partyId as string];
            let currentValue = Number(xss(e?.target?.value));
            // this isn't ideal, we're changing the input
            // the user should know where the cursor is
            // and adjust accordingly
            // if it was a 0, trim the trailing 0
            if (prevValue === 0) {
                currentValue = Number(String(currentValue)[0]);
            }
            return { ...prevState, [partyId as string]: currentValue };
        });
    };

    const validate = (override = false) => {
        // don't show an error message unless we should be validating
        if (!shouldValidate && !override) return;

        // no beneficiary percentage should be 0
        for (const beneficiary in benefitPercentages) {
            if (benefitPercentages[beneficiary] === 0) {
                setError({
                    hasError: true,
                    failedValidation: true,
                    message: t('sideSheet.allocation.allocationsMustNotEqual0'),
                });
                return;
            }
        }

        // total percentage needs to be 100
        if (totalPercent !== 100) {
            setError({
                hasError: true,
                failedValidation: true,
                message: t('sideSheet.allocation.allocationsTotalMustEqual100Pct'),
            });
            return;
        }

        // only modify the error object if validation has failed previously
        if (error.failedValidation) {
            setError({
                hasError: false,
                failedValidation: true,
                message: '',
            });
        }
    };

    useEffect(() => {
        const validateSelections = () => {
            const totalPercentageIs100 = totalPercent === 100;
            const noPercantageIs0 = Object.values(benefitPercentages).every(percentage => percentage > 0);
            return totalPercentageIs100 && noPercantageIs0;
        };
        const totalPercent = calculateTotalPercent(benefitPercentages);
        setTotalPercent(totalPercent);

        onChange(convertBenefitPercentagesToAllocationPercentages(benefitPercentages), validateSelections());
    }, [benefitPercentages]);

    useEffect(() => {
        setShouldValidate(needsValidation);
        if (needsValidation) {
            validate(true);
        }
    }, [needsValidation]);

    const { focusedParty, otherParties } = getBeneficiariesByFocusedParty(beneficiaries, focusedPartyId);

    const title =
        partyRole === PartyRole.PRIMARYBENEFICIARY
            ? t('sideSheet.allocation.primaryBeneficiaries')
            : t('sideSheet.allocation.contingentBeneficiaries');

    const contingentTitle =
        partyRole === PartyRole.PRIMARYBENEFICIARY
            ? t('sideSheet.allocation.otherPrimaryBeneficiaries')
            : t('sideSheet.allocation.otherContingentBeneficiaries');

    return (
        <div className={`pb-6 ${className}`}>
            {focusedPartyId && focusedParty && (
                <>
                    <AllocationField
                        key={`allocationField-${partyRole}-${focusedParty.partyId}`}
                        beneficiaryPercentage={benefitPercentages[focusedParty.partyId as string]}
                        className="border-b-2 border-gray-100 pb-6"
                        isFirst={true}
                        partyLabelVariant={TypographyVariant.LabelLgAlt}
                        firstLastName={focusedParty.firstLastName}
                        onBlur={() => {
                            validate();
                        }}
                        onChange={setBeneficiaryPercentage(focusedParty.partyId as string)}
                        partyId={focusedParty.partyId}
                    />
                    <div className="mb-4 mt-6">
                        <Typography variant={TypographyVariant.LabelLg}>{contingentTitle}</Typography>
                    </div>
                </>
            )}
            <div className="flex flex-col justify-between gap-6">
                {!focusedParty && <Typography variant={TypographyVariant.LabelLg}>{title}</Typography>}
                {!!otherParties?.length &&
                    otherParties.map(({ firstLastName, partyId }, index) => (
                        <AllocationField
                            key={`allocationField-${partyRole}-${partyId}`}
                            beneficiaryPercentage={benefitPercentages[partyId as string]}
                            isFirst={!index && !focusedParty}
                            partyLabelVariant={focusedParty ? TypographyVariant.LabelMdAlt : TypographyVariant.LabelLgAlt}
                            firstLastName={firstLastName}
                            onBlur={() => {
                                validate();
                            }}
                            onChange={setBeneficiaryPercentage(partyId)}
                            partyId={partyId}
                        />
                    ))}
            </div>
            <div className="mt-8 flex w-full justify-between">
                <div>
                    <Typography variant={TypographyVariant.LabelLg}>{t('general.total')}</Typography>
                </div>
                <Content
                    className={error.hasError ? 'text-semantic-error' : 'text-gray-900'}
                    variant={ContentVariant.Value}
                    details={`${totalPercent}%`}
                />
            </div>
            {error.failedValidation && (
                <div>
                    <AssistiveText
                        className="py-2"
                        text={error.hasError ? error.message : t('sideSheet.allocation.totalAllocationsEqual100Pct')}
                        variant={error.hasError ? AssistiveTextVariant.Error : AssistiveTextVariant.Success}
                    />
                </div>
            )}
        </div>
    );
};

export default BeneficiaryAllocator;
