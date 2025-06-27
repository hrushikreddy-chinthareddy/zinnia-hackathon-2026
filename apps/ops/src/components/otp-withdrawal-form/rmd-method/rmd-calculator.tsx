import useDebounce from '@xd/hooks/useDebounce';
import { RelationshipToParty } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useEffect, useState, useContext, ChangeEvent } from 'react';
import xss from 'xss';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import { Loader } from '@deps/components/page-loader';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { calculateAgeNumber } from '@deps/helpers/age.helpers';
import { useAccountInfo } from '@deps/hooks/otp-withdrawal/useAccountInfo';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { QualTypes } from '@deps/models/case/withdrawal/case';
import {
    CalculateRmdBody,
    RmdParty,
    RmdQualTypes,
    RmdRoles,
    VariableQuoteDescription,
} from '@deps/models/case/withdrawal/rmd';
import { getVariableQuote } from '@deps/queries/api/policies';
import { calculateRmd } from '@deps/queries/api/rmd-calculation';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { RMDMethodId, frequencyToValue } from './rmd-method';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export const findOverlaps = (rmds: RMDMethodId[]): RMDMethodId[] => {
    const sortedPrograms = [...rmds].sort((a, b) =>
        a.startDate.text.localeCompare(b.startDate.text)
    );

    const overlappingRmds = new Set<RMDMethodId>();

    let foundZero = false;
    sortedPrograms.forEach((rmdProgram, index) => {
        const frequency =
            (rmdProgram?.frequency?.text &&
                (frequencyToValue as any)[rmdProgram?.frequency?.text]) ||
            frequencyToValue.Annually;
        // if a 0-duration (perpetual) program started before this program, this program has been added and no need to continue with this logic
        if (foundZero) {
            return;
        }

        if (index < sortedPrograms.length - 1) {
            let isZeroDuration = false;
            if (Number(rmdProgram?.duration?.text) === 0) {
                isZeroDuration = true;
                foundZero = true;
            }
            const calculatedEndDate = isZeroDuration
                ? ''
                : dayjs(rmdProgram?.startDate?.text, ZAHARA_API_DATE_FORMAT)
                      .add(
                          (Number(rmdProgram?.duration?.text) - 1) * frequency,
                          'month'
                      )
                      .add(1, 'day')
                      .format(ZAHARA_API_DATE_FORMAT)
                      .toString();

            let j = index + 1;

            if (
                (isZeroDuration && j < sortedPrograms.length) ||
                (!isZeroDuration &&
                    calculatedEndDate > sortedPrograms[j].startDate.text)
            ) {
                overlappingRmds.add(rmdProgram);
            }

            // if this is a zero-duration (perpetual) program and there are programs that start after this one, zero-duration will overlap them
            while (
                j < sortedPrograms.length &&
                (isZeroDuration ||
                    calculatedEndDate > sortedPrograms[j].startDate.text)
            ) {
                overlappingRmds.add(sortedPrograms[j]);
                ++j;
            }
        }
    });

    return Array.from(overlappingRmds);
};

const calculateAgeDifference = (
    ownerAge: string,
    spouseAgee: string
): number => {
    if (!ownerAge || !spouseAgee) return 0;
    const ownerAgeNumber = calculateAgeNumber(ownerAge) || 0;
    const spouseAgeNumber = calculateAgeNumber(spouseAgee) || 0;
    const ageDiff = ownerAgeNumber - spouseAgeNumber;
    return ageDiff;
};

interface RMDCalculatorProps {
    isFormStateReadOnly?: boolean;
}

const getAnnuitants = (parties: LifeCadParty[]) => {
    return (
        parties?.filter(
            (party) =>
                [0, 3].includes(party.SrcRoleOptionId) &&
                [-1, -2].includes(party.SrcRoleType)
        ) || []
    );
};

const getOwnerDOB = (parties: LifeCadParty[]) => {
    return (
        parties?.find(
            (owner) =>
                owner.SrcRoleOptionId === 0 &&
                owner?.SrcRole?.toLowerCase().includes(
                    RmdRoles.Insured.toLowerCase()
                )
        )?.DateOfBirth || ''
    );
};

export default function RMDCalculator({
    isFormStateReadOnly,
}: RMDCalculatorProps) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.rmdMethod',
    });
    const { initialForm, parties } = useContext(FormDataContext);
    const { contractStatus, qualType } = useAccountInfo(
        initialForm?.data?.contractNum,
        initialForm.carrier as string
    );
    const currentDate = dayjs().format('YYYY');
    const [rmdYear, setRmdYear] = useState<string>(currentDate);
    const [priorYearMrdBasisValue, setPriorYearMrdBasisValue] =
        useState<number>(0);
    const [calculatedAmount, setCalculatedAmount] = useState<number>(0);
    const [rmdFactor, setRmdFactor] = useState<number>(0);
    const [apiError, setApiError] = useState<string>('');
    const [loader, setLoader] = useState(false);
    const debouncedValue = useDebounce(priorYearMrdBasisValue, 500);
    const [annuitants, setAnnuitants] = useState<RmdParty[]>([]);

    useEffect(() => {
        const annuitants = getAnnuitants(parties as LifeCadParty[]);

        const filteredAnnuitants = annuitants?.map((party) => {
            const annuitant: RmdParty = {
                partyRole: party?.SrcRole?.toLowerCase().includes(
                    RmdRoles.Insured.toLowerCase()
                )
                    ? RmdRoles.Insured
                    : RmdRoles.PrimaryBeneficiary,
                partyType: party.PersonType,
                fullName: party.FullName,
                dateOfBirth: party.DateOfBirth || '',
            };
            // Joint life check Spouse, Husband, Wife
            if ([10, 16, 23, 106].includes(Number(party.SrcRelToOwnerId))) {
                const ownerAgeDateOfBirth = getOwnerDOB(
                    parties as LifeCadParty[]
                );
                const ageDifference = calculateAgeDifference(
                    ownerAgeDateOfBirth,
                    party?.DateOfBirth
                );
                if (ageDifference > 10) {
                    annuitant.relationshipToInsured =
                        RelationshipToParty.SPOUSE;
                }
            }

            return annuitant;
        });

        setAnnuitants(filteredAnnuitants || []);
    }, []);

    useEffect(() => {
        setApiError('');
        const getRMDFactor = async (rmdYear: string) => {
            if (priorYearMrdBasisValue !== 0 || apiError !== '') {
                try {
                    if (rmdYear.length < 4) {
                        return;
                    }
                    const query: CalculateRmdBody = {
                        policy: {
                            policyNumber: initialForm?.data?.contractNum,
                            QualificationType:
                                qualType == QualTypes.NonQualified
                                    ? RmdQualTypes.NonQualified
                                    : RmdQualTypes.Qualified,
                            policyStatus: contractStatus || '',
                            policyValues: [
                                {
                                    taxYear: Number(rmdYear),
                                    rmdBasis: Number(priorYearMrdBasisValue),
                                },
                            ],
                            parties: annuitants,
                        },
                    };

                    setLoader(true);
                    const response = await calculateRmd(query);

                    setRmdFactor(
                        response.items.calculatedValues[0].duration || 0
                    ); // rmdFactor
                    response.items.calculatedValues[0].rmdBasis &&
                        setPriorYearMrdBasisValue(
                            response.items.calculatedValues[0].rmdBasis
                        ); // MRD Basis value
                    setLoader(false);
                } catch (e: any) {
                    setRmdFactor(0);
                    setLoader(false);
                    setApiError(e?.message as string);
                    console.error(
                        'GetRMDSpecialPrograms::Error retrieving special program list',
                        e
                    );
                }
            }
        };

        getRMDFactor(rmdYear);
    }, [rmdYear, debouncedValue]);

    // calculate rmd
    useEffect(() => {
        rmdFactor !== 0
            ? setCalculatedAmount(
                  Number(priorYearMrdBasisValue) / Number(rmdFactor)
              )
            : setCalculatedAmount(0);
    }, [priorYearMrdBasisValue, rmdFactor]);

    useEffect(() => {
        const getRMDBasisValue = async (rmdYear: string) => {
            try {
                if (rmdYear.length < 4) {
                    return;
                }

                const response = await getVariableQuote({
                    contractNumber: initialForm?.data?.contractNum,
                    clientCode: initialForm?.data?.clientCode,
                    valuationDate: `${rmdYear}-01-01`,
                });

                const mrdBasis = response?.variableQuoteArray?.find(
                    (variableQuote) =>
                        variableQuote.variableDescription ==
                        VariableQuoteDescription.MRDBasis
                )?.variableValue;

                setPriorYearMrdBasisValue(Number(mrdBasis) || 0);
            } catch (e: any) {
                setPriorYearMrdBasisValue(0);

                setApiError(e?.message as string);
                console.error(
                    'GetRMDBasisValue::Error retrieving variable quote api',
                    e
                );
            }
        };

        getRMDBasisValue(rmdYear);
    }, [rmdYear]);

    const updateMRDBasisValue = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setPriorYearMrdBasisValue(Number(value));
    };

    return (
        <div className="mt-4 border-b-2 border-gray-100 p-2">
            <div className="flex gap-4 sm:gap-8">
                <div>
                    <Field
                        label={t(`rmdYear`) as string}
                        onChange={(e) => {
                            setRmdYear(xss(e?.target?.value));
                        }}
                        formatOptions={{
                            format: '####',
                        }}
                        value={rmdYear}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        variant={
                            isFormStateReadOnly
                                ? FieldVariant.Inactive
                                : FieldVariant.Default
                        }
                        data-testid={`rmdyear`}
                    />
                    {apiError && (
                        <AssistiveText
                            text={apiError}
                            variant={AssistiveTextVariant.Error}
                            className="mt-2"
                        />
                    )}
                </div>
                <Field
                    label={t(`mrdBasisValue`) as string}
                    onChange={updateMRDBasisValue}
                    formatOptions={{
                        format: '',
                        type: 'number',
                        decimalPlaces: 2,
                    }}
                    value={priorYearMrdBasisValue.toString()}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    variant={
                        isFormStateReadOnly
                            ? FieldVariant.Inactive
                            : FieldVariant.Default
                    }
                    data-testid={`priorYearMrdBasisValue`}
                />

                {loader ? (
                    <Loader />
                ) : (
                    <Field
                        label={t(`calculatedAmount`) as string}
                        onChange={noop}
                        value={calculatedAmount.toString()}
                        size={FieldSize.Small}
                        formatOptions={{
                            format: '',
                            type: 'number',
                            decimalPlaces: 2,
                        }}
                        leading={<div>$</div>}
                        type={FieldType.BaseActive}
                        data-testid={`calculatedAmount`}
                        variant={FieldVariant.Inactive}
                    />
                )}
            </div>
        </div>
    );
}
