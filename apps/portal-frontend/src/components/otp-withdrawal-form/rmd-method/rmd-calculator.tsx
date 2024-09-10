import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useEffect, useState, useContext, ChangeEvent } from 'react';
import xss from 'xss';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import { Loader } from '@deps/components/page-loader';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { CalculateRmdBody } from '@deps/models/case/withdrawal/rmd';
import { calculateRmd } from '@deps/queries/api/integration';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import useDebounce from '@deps/utils/useDebounce';

import { RMDMethodId, frequencyToValue } from './rmd-method';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export const findOverlaps = (rmds: RMDMethodId[]): RMDMethodId[] => {
    const sortedPrograms = [...rmds].sort((a, b) => a.startDate.text.localeCompare(b.startDate.text));

    const overlappingRmds = new Set<RMDMethodId>();

    let foundZero = false;
    sortedPrograms.forEach((rmdProgram, index) => {
        const frequency =
            (rmdProgram?.frequency?.text && (frequencyToValue as any)[rmdProgram?.frequency?.text]) || frequencyToValue.Annually;
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
                      .add((Number(rmdProgram?.duration?.text) - 1) * frequency, 'month')
                      .add(1, 'day')
                      .format(ZAHARA_API_DATE_FORMAT)
                      .toString();

            let j = index + 1;

            if (
                (isZeroDuration && j < sortedPrograms.length) ||
                (!isZeroDuration && calculatedEndDate > sortedPrograms[j].startDate.text)
            ) {
                overlappingRmds.add(rmdProgram);
            }

            // if this is a zero-duration (perpetual) program and there are programs that start after this one, zero-duration will overlap them
            while (j < sortedPrograms.length && (isZeroDuration || calculatedEndDate > sortedPrograms[j].startDate.text)) {
                overlappingRmds.add(sortedPrograms[j]);
                ++j;
            }
        }
    });

    return Array.from(overlappingRmds);
};

interface RMDCalculatorProps {
    isFormStateReadOnly?: boolean,
}
export default function RMDCalculator({ isFormStateReadOnly}: RMDCalculatorProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.rmdMethod' });
    const { initialForm } = useContext(FormDataContext);
    const currentDate = dayjs().format('YYYY');
    const [rmdYear, setRmdYear] = useState<string>(currentDate);
    const [priorYearMrdBasisValue, setPriorYearMrdBasisValue] = useState<number>(0);
    const [calculatedAmount, setCalculatedAmount] = useState<number>(0);
    const [rmdFactor, setRmdFactor] = useState<number>(0);
    const [apiError, setApiError] = useState<string>('');
    const [loader, setLoader] = useState(false);
    const debouncedValue = useDebounce(priorYearMrdBasisValue, 500);


    // what will be the default value?

    useEffect(() => {
        // clear exsiting MRD basis value
        setApiError('');
        const getRMDFactor = async (rmdYear: string) => {
            if (debouncedValue === 0 || apiError !== '') {
                try {
                    if (rmdYear.length < 4) {
                        return;
                    }
                    const query: CalculateRmdBody = {
                        rmdYear: rmdYear,
                        mrdBasicValue: apiError !== '' ? debouncedValue : 0, // If apiError is not empty passing MRD basis value, otherwise Passing 0 to get the factor, which allows us to calculate the amount on the front end
                    };

                    setLoader(true);
                    const response = await calculateRmd(query, initialForm?.data?.contractNum, initialForm.carrier);

                    setRmdFactor(response.lifeExpectancy); // rmdFactor
                    response.mrdBasicValue && setPriorYearMrdBasisValue(response.mrdBasicValue); // MRD Basis value
                    setLoader(false);
                } catch (e: any) {
                    setRmdFactor(0);
                    setPriorYearMrdBasisValue(0);
                    setLoader(false);
                    setApiError(e?.message as string);
                    console.error('GetRMDSpecialPrograms::Error retrieving special program list', e);
                }
            }
        };

        getRMDFactor(rmdYear);
    }, [rmdYear, debouncedValue]);

    // calculate rmd
    useEffect(() => {
        rmdFactor !== 0 ? setCalculatedAmount(Number(priorYearMrdBasisValue) / Number(rmdFactor)) : setCalculatedAmount(0);
    }, [priorYearMrdBasisValue, rmdFactor]);

    useEffect(() => {
        if (rmdYear.length === 4) {
            setPriorYearMrdBasisValue(0);
        }
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
                        onChange={e => {
                            setRmdYear(xss(e?.target?.value));
                        }}
                        formatOptions={{
                            format: '####',
                        }}
                        value={rmdYear}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                        data-testid={`rmdyear`}
                    />
                    {apiError && <AssistiveText text={apiError} variant={AssistiveTextVariant.Error} className="mt-2" />}
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
                    variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
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
