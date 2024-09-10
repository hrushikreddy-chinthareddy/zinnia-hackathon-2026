import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import React, { useState, useEffect, useContext } from 'react';

import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import FieldDateSelect, { DATE_PICKER_FORMAT } from '@deps/components/fields/field-date-select/field-date-select';
import { Loader } from '@deps/components/page-loader';
import SelectSimple from '@deps/components/select/select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { RMDProgramType, Terminateprogram, SpecialProgram } from '@deps/models/case/withdrawal/case';
import { getSpecialPrograms } from '@deps/queries/api/policies';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const ProgramType = {
    PremiumDefault: 0,
    SSW: 2,
    RMD: 4,
    SSWNet: 6,
};

interface ExistingProgramsProps {
    disableAllPrograms?: boolean;
    terminated?: Terminateprogram[];
    onDataChange?: (value: Terminateprogram[]) => void;
}

export default function ExistingPrograms({ disableAllPrograms = false, terminated, onDataChange }: ExistingProgramsProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.rmdMethod' });
    const { initialForm } = useContext(FormDataContext);

    const [sswprograms, setsswprograms] = useState<Program[]>([]);
    const [rmdPrograms, setrmdPrograms] = useState<Program[]>([]);
    const [loader, setLoader] = useState(false);

    const [programs, setActivePrograms] = useState<SpecialProgram[] | null>([]);

    const rmdProgramStatus = [
        {
            label: t(`active`),
            value: RMDProgramType.Active,
        },
        {
            label: t(`terminate`),
            value: RMDProgramType.Terminate,
        },
    ];

    useEffect(() => {
        const getPrograms = async () => {
            try {
                setLoader(true);
                setActivePrograms([]);
                const spcialProgramdetails = await getSpecialPrograms(initialForm.data.contractNum, initialForm.carrier);

                setActivePrograms(
                    spcialProgramdetails?.allocationDetails?.filter(
                        program =>
                            [ProgramType.PremiumDefault, ProgramType.RMD, ProgramType.SSW, ProgramType.SSWNet].includes(
                                program.typeOfAlloc
                            ) &&
                            (program.termDate === '' || dayjs().isBefore(program.termDate))
                    ) || null
                );
                setLoader(false);
            } catch (e) {
                setLoader(false);
                console.error('GetRMDSpecialPrograms::Error retrieving special program list', e);
            }
        };

        getPrograms();
    }, []);

    useEffect(() => {
        const sswPrograms: Program[] = [];
        const rmdPrograms: Program[] = [];

        programs?.forEach(program => {
            if ([ProgramType.SSW, ProgramType.SSWNet].includes(program.typeOfAlloc)) {
                sswPrograms.push({
                    programType: 'SSW',
                    startDate: program.startDate,
                    nextDate: program.nextDate,
                    amount: program.dbAmount.toString(),
                    frequency: program.mode,
                    duration: program.duration.toString(),
                    status: RMDProgramType.Active,
                    allocationId: program.allocationId,
                });
            }

            if (program.typeOfAlloc === ProgramType.RMD) {
                rmdPrograms.push({
                    programType: 'RMD',
                    startDate: program.startDate,
                    nextDate: program.nextDate,
                    amount: program.dbAmount.toString(),
                    frequency: program.mode,
                    duration: program.duration.toString(),
                    status: RMDProgramType.Active,
                    allocationId: program.allocationId,
                });
            }
        });

        setsswprograms(sswPrograms);
        setrmdPrograms(rmdPrograms);
    }, [programs]);

    const addtoTerminatedprograms = (status: RMDProgramType, program: Program) => {
        program.programType === 'RMD' &&
            setrmdPrograms(
                rmdPrograms.map(item => ({ ...item, status: item.allocationId === program.allocationId ? status : item.status }))
            );
        program.programType === 'SSW' &&
            setsswprograms(
                sswprograms.map(item => ({ ...item, status: item.allocationId === program.allocationId ? status : item.status }))
            );

        if (terminated && onDataChange) {
            status === RMDProgramType.Active && onDataChange(terminated.filter(item => item.allocationId.text !== program.allocationId));
        }

        if (status === RMDProgramType.Terminate) {
            const termProgram = {
                startDate: { text: program.startDate },
                allocationId: { text: program.allocationId },
            };
            if (terminated && onDataChange) {
                onDataChange([...terminated, termProgram]);
            }
        }
    };

    const allPrograms =
        rmdPrograms.length || sswprograms.length ? (
            <div className="border-b-2 border-gray-100 p-2">
                {sswprograms.length > 0 && (
                    <Typography variant={TypographyVariant.BodyBold} className="my-2">
                        {t('transactions.sswPrograms')}
                    </Typography>
                )}
                {sswprograms.map((item, i) => {
                    return (
                        <div className="my-2 grid grid-cols-auto-2 gap-2" key={i}>
                            <Program program={item} isFormStateReadOnly={disableAllPrograms} />
                            <SelectSimple
                                label={t('action') as string}
                                options={rmdProgramStatus}
                                onChange={val => addtoTerminatedprograms(val as RMDProgramType, item)}
                                size={FieldSize.Small}
                                value={item.status}
                                variant={disableAllPrograms ? FieldVariant.Inactive : FieldVariant.Default}
                                disabled={disableAllPrograms}
                            />
                        </div>
                    );
                })}

                {rmdPrograms.length > 0 && (
                    <Typography variant={TypographyVariant.BodyBold} className="my-2">
                        {t('transactions.rmdPrograms')}
                    </Typography>
                )}
                {rmdPrograms.map((item, i) => {
                    return (
                        <div className="my-2 grid grid-cols-auto-2 gap-2" key={i}>
                            <Program program={item} isFormStateReadOnly={disableAllPrograms} />
                            <SelectSimple
                                label={t('action') as string}
                                options={rmdProgramStatus}
                                onChange={val => addtoTerminatedprograms(val as RMDProgramType, item)}
                                size={FieldSize.Small}
                                value={item.status}
                                variant={disableAllPrograms ? FieldVariant.Inactive : FieldVariant.Default}
                                disabled={disableAllPrograms}
                            />
                        </div>
                    );
                })}
            </div>
        ) : null;

    return (
        <>
            {loader && <Loader />}
            {programs && programs.length > 0 ? allPrograms : null}
        </>
    );
}

interface Program {
    programType: string;
    startDate: string;
    nextDate: string;
    amount: string;
    frequency: string;
    duration: string;
    status: RMDProgramType;
    allocationId: number;
}
interface ProgramProps {
    program: Program;
    isFormStateReadOnly: boolean;
}
export function Program({ program, isFormStateReadOnly }: ProgramProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.rmdMethod' });

    return (
        <div className="readonly pointer-events-none grid grid-cols-auto-4 gap-2">
            <FieldDateSelect
                label={t('startDate') as string}
                id="startDate"
                isFutureDateDisabled={false}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                variant={FieldVariant.Inactive}
                onChange={noop}
                value={program.startDate ? dayjs(program.startDate, ZAHARA_API_DATE_FORMAT).format(DATE_PICKER_FORMAT) : ''}
                disabled={isFormStateReadOnly}
            />

            <FieldDateSelect
                label={t('transactions.nextDate') as string}
                id="nextDate"
                isFutureDateDisabled={false}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                variant={FieldVariant.Inactive}
                onChange={noop}
                value={program.nextDate ? dayjs(program.nextDate, ZAHARA_API_DATE_FORMAT).format(DATE_PICKER_FORMAT) : ''}
                disabled={isFormStateReadOnly}
            />

            <Field
                label={t(`duration`) as string}
                value={program.duration}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                variant={FieldVariant.Inactive}
                onChange={noop}
            />

            <Field
                label={t(`amount`) as string}
                value={program.amount}
                size={FieldSize.Small}
                leading={<div>$</div>}
                type={FieldType.BaseActive}
                variant={FieldVariant.Inactive}
                onChange={noop}
            />
        </div>
    );
}
