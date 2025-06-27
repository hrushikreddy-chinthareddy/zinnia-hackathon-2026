import { useTranslation } from 'next-i18next';
import { useState, useEffect, useContext } from 'react';

import { FieldSize, FieldVariant } from '@deps/components/fields/field';
import { Loader } from '@deps/components/page-loader';
import SelectSimple from '@deps/components/select/select';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { useSpecialProgram } from '@deps/hooks/useSpecialProgram';
import {
    RMDProgramType,
    Terminateprogram,
} from '@deps/models/case/withdrawal/case';

import { Program } from './program-item';

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

export default function ExistingPrograms({
    disableAllPrograms = false,
    terminated,
    onDataChange,
}: ExistingProgramsProps) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.rmdMethod',
    });
    const { initialForm } = useContext(FormDataContext);

    const [sswprograms, setsswprograms] = useState<Program[]>([]);
    const [rmdPrograms, setrmdPrograms] = useState<Program[]>([]);

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

    const { activePrograms, isLoading } = useSpecialProgram(initialForm);

    useEffect(() => {
        const sswPrograms: Program[] = [];
        const rmdPrograms: Program[] = [];

        activePrograms?.forEach((program) => {
            if (
                [ProgramType.SSW, ProgramType.SSWNet].includes(
                    program.typeOfAlloc
                )
            ) {
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
    }, [activePrograms]);

    const addtoTerminatedprograms = (
        status: RMDProgramType,
        program: Program
    ) => {
        program.programType === 'RMD' &&
            setrmdPrograms(
                rmdPrograms.map((item) => ({
                    ...item,
                    status:
                        item.allocationId === program.allocationId
                            ? status
                            : item.status,
                }))
            );
        program.programType === 'SSW' &&
            setsswprograms(
                sswprograms.map((item) => ({
                    ...item,
                    status:
                        item.allocationId === program.allocationId
                            ? status
                            : item.status,
                }))
            );

        if (terminated && onDataChange) {
            status === RMDProgramType.Active &&
                onDataChange(
                    terminated.filter(
                        (item) =>
                            item.allocationId.text !== program.allocationId
                    )
                );
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
                    <Typography
                        variant={TypographyVariant.BodyBold}
                        className="my-2"
                    >
                        {t('transactions.sswPrograms')}
                    </Typography>
                )}
                {sswprograms.map((item, i) => {
                    return (
                        <div
                            className="my-2 grid grid-cols-auto-2 gap-2"
                            key={i}
                        >
                            <Program
                                program={item}
                                isFormStateReadOnly={disableAllPrograms}
                            />

                            <SelectSimple
                                label={t('action') as string}
                                options={rmdProgramStatus}
                                onChange={(val) =>
                                    addtoTerminatedprograms(
                                        val as RMDProgramType,
                                        item
                                    )
                                }
                                size={FieldSize.Small}
                                value={item.status}
                                variant={
                                    disableAllPrograms
                                        ? FieldVariant.Inactive
                                        : FieldVariant.Default
                                }
                                disabled={disableAllPrograms}
                            />
                        </div>
                    );
                })}

                {rmdPrograms.length > 0 && (
                    <Typography
                        variant={TypographyVariant.BodyBold}
                        className="my-2"
                    >
                        {t('transactions.rmdPrograms')}
                    </Typography>
                )}
                {rmdPrograms.map((item, i) => {
                    return (
                        <div
                            className="my-2 grid grid-cols-auto-2 gap-2"
                            key={i}
                        >
                            <Program
                                program={item}
                                isFormStateReadOnly={disableAllPrograms}
                            />
                            <SelectSimple
                                label={t('action') as string}
                                options={rmdProgramStatus}
                                onChange={(val) =>
                                    addtoTerminatedprograms(
                                        val as RMDProgramType,
                                        item
                                    )
                                }
                                size={FieldSize.Small}
                                value={item.status}
                                variant={
                                    disableAllPrograms
                                        ? FieldVariant.Inactive
                                        : FieldVariant.Default
                                }
                                disabled={disableAllPrograms}
                            />
                        </div>
                    );
                })}
            </div>
        ) : null;

    return (
        <>
            {isLoading && <Loader />}
            {activePrograms && activePrograms.length > 0 ? allPrograms : null}
        </>
    );
}
