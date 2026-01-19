import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useContext, useState, FormEvent, useEffect } from 'react';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import Button, {
    ButtonSize,
    ButtonType,
    ButtonVariant,
} from '@deps/components/button/button';
import ButtonGrp from '@deps/components/button-group/button-group';
import IconButton from '@deps/components/icon-button/icon-button';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { CaseType, Processes } from '@deps/models/case/case';
import {
    AmountType,
    Frequency,
    RMDProgram,
    Terminateprogram,
    WithdrawalType,
    RMDType,
} from '@deps/models/case/withdrawal/case';
import { ReactComponent as RemoveIcon } from '@deps/styles/elements/icons/icons_outlined/trash.svg';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import ExistingPrograms from './existing-programs';
import RMDCalculator, { findOverlaps } from './rmd-calculator';
import RMDOptions from './rmd-row';

export const DEFAULT_RMD_PROGRAM = {
    startDate: { text: '' },
    frequency: { text: Frequency.Annually },
    duration: { text: '0' },
    amount: { text: '', amountType: AmountType.Dollar },
};

export const DEFAULT_RMD = {
    rmdType: null,
    rmdSubType: null,
    rmdRelationship: null,
    ralationshipDate: null,
    rmdAmount: null,
    fullName: null,
    firstName: null,
    middleName: null,
    lastName: null,
    dob: { text: null },
    isJointLifeExpectancy: false,
    rmdPrograms: [],
    taxId: { text: null },
    rmdMethod: null,
    rmdYear: null,
    priorYearMrdBasisValue: null,
    calculatedAmount: null,
};

export interface RMDMethodId extends RMDProgram {
    id?: string;
}

const getrmdRows = (rmds: RMDProgram[]): RMDMethodId[] => {
    return rmds.map((method) => {
        const id = Math.random().toString();
        return { ...method, id: id };
    });
};

export const frequencyToValue: Record<string, number> = {
    [Frequency.None]: 0,
    [Frequency.Monthly]: 1,
    [Frequency.Quarterly]: 3,
    [Frequency.SemiAnnually]: 6,
    [Frequency.Annually]: 12,
};

interface RMDMethodProps {
    isFormStateReadOnly: boolean;
    rmdTypeOptions?: {
        label: string;
        value: RMDType;
    }[];
    isQCD?: boolean;
    isLC?: boolean;
}

export type RmdOptionsFieldsConfig = {
    startDate: boolean;
    frequency: boolean;
    duration: boolean;
    amount: boolean;
};

export default function RMDMethod({
    isFormStateReadOnly,
    rmdTypeOptions,
    isQCD = false,
    isLC = true,
}: RMDMethodProps) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.rmdMethod',
    });
    const { formProgram, setFormProgram, formErrors } =
        useContext(FormDataContext);

    const [rmdRows, setrmdRows] = useState<RMDMethodId[]>(
        getrmdRows(formProgram?.rmd?.rmdPrograms || [DEFAULT_RMD_PROGRAM])
    );
    const [terminated, setTerminated] = useState<Terminateprogram[]>([]);
    const [rmdMethod, setRmdMethod] = useState(
        formProgram?.rmd?.rmdMethod || RMDType.AutoRMD
    );
    const [overlappingRmds, setOverlappingRmds] = useState<string[]>([]);

    const addRmdRow = (e: FormEvent) => {
        e.preventDefault();
        const id = Math.random().toString();

        // get last rmd method data
        const previousItem = rmdRows[rmdRows.length - 1];
        const frequency =
            (previousItem?.frequency?.text &&
                frequencyToValue[previousItem?.frequency?.text]) ||
            frequencyToValue.Annually;

        const nextStartDate =
            (previousItem?.startDate?.text &&
                dayjs(previousItem?.startDate?.text, ZAHARA_API_DATE_FORMAT)
                    .add(
                        (Number(previousItem?.duration?.text) - 1) *
                            frequency || 0,
                        'month'
                    )
                    .add(1, 'day')
                    .format(ZAHARA_API_DATE_FORMAT)
                    .toString()) ||
            '';

        setrmdRows((val) => {
            return [
                ...val,
                {
                    ...DEFAULT_RMD_PROGRAM,
                    id,
                    startDate: { text: nextStartDate },
                },
            ];
        });
    };

    const setRMDData = (val: RMDMethodId, i: number) => {
        setrmdRows((data) => {
            return data.map((rmd, j) => {
                if (i !== j) {
                    return rmd;
                }

                return {
                    ...val,
                };
            });
        });
    };

    const handleRMDOptionDelete = (e: FormEvent, index: number) => {
        e.preventDefault();
        if (!isFormStateReadOnly) {
            removeRmdRow(index);
        }
    };

    const removeRmdRow = (i: number) => {
        setrmdRows((val) => val.filter((x, index) => i !== index));
    };

    useEffect(() => {
        const programs = rmdRows.map((method) => {
            const mappedparty = { ...method };
            (mappedparty.frequency = {
                text:
                    mappedparty.frequency.text === Frequency.None
                        ? ('' as Frequency)
                        : mappedparty.frequency.text,
            }),
                delete mappedparty.id;
            return mappedparty;
        });
        const overlappingIds = findOverlaps(rmdRows).map((val) => val.id ?? '');
        setOverlappingRmds(overlappingIds);

        const rmd = {
            ...DEFAULT_RMD,
            ...formProgram?.rmd,
            rmdPrograms: programs,
            rmdMethod: rmdMethod,
        };
        setFormProgram((prevFormProgram) => ({
            ...prevFormProgram,
            withdrawType: { text: WithdrawalType.Gross },
            program:
                prevFormProgram?.program?.text === Processes.QCD
                    ? { text: Processes.QCD }
                    : { text: Processes.RequiredMinimumDistribution },
            programType: prevFormProgram?.programType?.text
                ? prevFormProgram?.programType
                : { text: CaseType.Rmd },
            rmd: {
                ...rmd,
                rmdType: null,
                isOneTimeWithdrawal: rmdMethod === RMDType.OneTimeRMD,
            },
            terminateprograms: terminated,
        }));
    }, [rmdRows, terminated, rmdMethod]);
    const validateDuration = (programs: RMDProgram[]) => {
        return programs.some((program) => program?.duration?.text === '0');
    };

    const RmdMultipleTypeOptions = [
        { label: t(`rmdTypes.auto`), value: RMDType.AutoRMD },
        { label: t(`rmdTypes.calculate`), value: RMDType.CalculateRMD },
    ];

    let rmdOptionsFieldsConfig = {
        startDate: true,
        frequency: true,
        duration: true,
        amount: true,
    };

    if (!isLC) {
        if (rmdMethod === RMDType.AutoRMD) {
            rmdOptionsFieldsConfig = {
                startDate: true,
                frequency: true,
                duration: true,
                amount: false,
            };
        }
        if (rmdMethod === RMDType.OneTimeRMD) {
            rmdOptionsFieldsConfig = {
                startDate: true,
                frequency: false,
                duration: false,
                amount: true,
            };
        }
    }

    return (
        <CardContainer containerClassNames={`border-b-2 border-gray-100`}>
            <Typography variant={TypographyVariant.H3} className="my-2">
                {t(`title`)}
            </Typography>
            <div>
                <ButtonGrp
                    activeValue={rmdMethod || ''}
                    groupLabel=""
                    toggle={(val) => {
                        setRmdMethod(val as RMDType);
                    }}
                    labels={rmdTypeOptions ?? RmdMultipleTypeOptions}
                    disabled={isFormStateReadOnly}
                />
            </div>

            <ExistingPrograms
                terminated={terminated}
                onDataChange={setTerminated}
                disableAllPrograms={true}
                isLC={isLC}
            />
            {rmdMethod === RMDType.CalculateRMD && (
                <RMDCalculator
                    isFormStateReadOnly={isFormStateReadOnly}
                    rmdMethod={rmdMethod}
                />
            )}
            {!isQCD && (
                <div className="p-2">
                    <Typography
                        variant={TypographyVariant.BodyBold}
                        className="my-2"
                    >
                        {rmdMethod === RMDType.AutoRMD
                            ? t(`newRmdProgram`)
                            : t(`oneTimeRmd`)}
                    </Typography>
                    {rmdRows.map((rmdMethod, index) => (
                        <div
                            key={rmdMethod.id}
                            className={`grid grid-cols-auto-2 p-2 ${
                                overlappingRmds.includes(rmdMethod.id as string)
                                    ? 'my-4 rounded border-2 border-semantic-error'
                                    : ''
                            }`}
                        >
                            <div className="grid grid-cols-auto-2">
                                <RMDOptions
                                    onDataChange={(val) =>
                                        setRMDData(
                                            { ...val, id: rmdMethod.id },
                                            index
                                        )
                                    }
                                    rmdData={rmdMethod}
                                    isFormStateReadOnly={isFormStateReadOnly}
                                    formConfig={rmdOptionsFieldsConfig}
                                />
                                <IconButton
                                    className="ml-5 mt-6"
                                    onClick={(event) =>
                                        handleRMDOptionDelete(event, index)
                                    }
                                    aria-label={
                                        t('removeThisRmdProgram') as string
                                    }
                                    disabled={isFormStateReadOnly}
                                >
                                    {isLC && (
                                        <RemoveIcon height={25} width={25} />
                                    )}
                                </IconButton>
                            </div>
                        </div>
                    ))}

                    {isLC && (
                        <Button
                            onClick={addRmdRow}
                            size={ButtonSize.Small}
                            type={ButtonType.Primary}
                            className="my-4"
                            disabled={
                                validateDuration(rmdRows) || isFormStateReadOnly
                                    ? true
                                    : false
                            }
                            variant={
                                validateDuration(rmdRows) || isFormStateReadOnly
                                    ? ButtonVariant.Inactive
                                    : ButtonVariant.Default
                            }
                        >
                            {t('add')}
                        </Button>
                    )}
                </div>
            )}

            {formErrors && (
                <div className="flex flex-col">
                    {formErrors?.rmdMinimumRequiredPropgram && (
                        <AssistiveText
                            text={formErrors?.rmdMinimumRequiredPropgram}
                            variant={AssistiveTextVariant.Error}
                            className="mt-2"
                        />
                    )}
                    {formErrors?.rmdDateOverlap && (
                        <AssistiveText
                            text={formErrors?.rmdDateOverlap}
                            variant={AssistiveTextVariant.Error}
                            className="mt-2"
                        />
                    )}
                    {formErrors?.rmdDetectedDurationZero && (
                        <AssistiveText
                            text={formErrors?.rmdDetectedDurationZero}
                            variant={AssistiveTextVariant.Error}
                            className="mt-2"
                        />
                    )}
                    {formErrors?.rmdSystematicStartDate && (
                        <AssistiveText
                            text={formErrors?.rmdSystematicStartDate}
                            variant={AssistiveTextVariant.Error}
                            className="mt-2"
                        />
                    )}
                </div>
            )}
        </CardContainer>
    );
}
