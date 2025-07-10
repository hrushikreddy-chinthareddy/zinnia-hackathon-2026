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
import { CaseType } from '@deps/models/case/case';
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
    isLC?: boolean;
}

export default function ExistingPrograms({
    disableAllPrograms = false,
    terminated,
    onDataChange,
    isLC = true,
}: ExistingProgramsProps) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.rmdMethod',
    });
    const { initialForm, policySystematicPrograms } =
        useContext(FormDataContext);
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

    const { activePrograms, isLoading } = useSpecialProgram(initialForm, isLC);
    const activeSystematicPrograms = policySystematicPrograms?.filter(
        (item) => item.status === 'ACTIVE'
    );

    useEffect(() => {
        // TODO: Types to be updated on dev completion of DEPU-5199
        const mapProgramToSSW = (program: any) => ({
            programType: CaseType.SSW,
            startDate: program.startDate,
            nextDate: isLC ? program.nextDate : program.nextProgramDate,
            amount: (isLC ? program.dbAmount : program.amount).toString(),
            frequency: isLC ? program.mode : program.frequency,
            duration: isLC ? program.duration.toString() : '',
            status: RMDProgramType.Active,
            allocationId: isLC ? program?.allocationId : 0,
        });
        // TODO: any type to be updated on dev completion of DEPU-5199
        const mapProgramToRMD = (program: any) => ({
            programType: CaseType.Rmd,
            startDate: program.startDate,
            nextDate: isLC ? program.nextDate : program.nextProgramDate,
            amount: (isLC ? program.dbAmount : program.amount).toString(),
            frequency: isLC ? program.mode : program.frequency,
            duration: isLC ? program.duration.toString() : '',
            status: RMDProgramType.Active,
            allocationId: isLC ? program?.allocationId : 0,
        });

        const sswPrograms: Program[] = [];
        const rmdPrograms: Program[] = [];

        if (isLC) {
            activePrograms?.forEach((program) => {
                if (
                    [ProgramType.SSW, ProgramType.SSWNet].includes(
                        program.typeOfAlloc
                    )
                ) {
                    sswPrograms.push(mapProgramToSSW(program));
                }
                if (program.typeOfAlloc === ProgramType.RMD) {
                    rmdPrograms.push(mapProgramToRMD(program));
                }
            });
        } else {
            activeSystematicPrograms?.forEach((program) => {
                if (program.disbursementType === CaseType.Rmd) {
                    rmdPrograms.push(mapProgramToRMD(program));
                }
                if (program.disbursementType === 'Gross') {
                    sswPrograms.push(mapProgramToSSW(program));
                }
            });
        }

        setsswprograms(sswPrograms);
        setrmdPrograms(rmdPrograms);
    }, [activePrograms, activeSystematicPrograms, isLC]);
    // ...existing code...

    const addtoTerminatedprograms = (
        status: RMDProgramType,
        program: Program
    ) => {
        program.programType === CaseType.Rmd &&
            setrmdPrograms(
                rmdPrograms.map((item) => ({
                    ...item,
                    status:
                        item.allocationId === program.allocationId
                            ? status
                            : item.status,
                }))
            );
        program.programType === CaseType.SSW &&
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
                allocationId: { text: program?.allocationId },
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
                                isLC={isLC}
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
                                isLC={isLC}
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
            {activePrograms?.length > 0 || activeSystematicPrograms?.length > 0
                ? allPrograms
                : null}
        </>
    );
}
