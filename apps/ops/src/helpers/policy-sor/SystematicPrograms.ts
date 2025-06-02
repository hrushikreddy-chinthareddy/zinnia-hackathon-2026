import { ArrangementType, Reason, SystematicProgram as SysProg } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';

import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

//TODO: Remove this eventually because LifeCAD should be sending correct enum values in arrangementTypes
export enum TempAnnuityArrangementTypes {
    WITHDRAWAL = 'Sys Partial Wthdrwl(Gross)',
    REQUIREDMINIMUMDISTRIBUTION = 'Min Required Distribution',
}

export class SystematicPrograms {
    public systematicProgramById: Record<string, SysProg> = {};
    public systematicProgramsByReason: Record<string, SysProg[]> = {};
    public systematicProgramsByType: Record<string, SysProg[]> = {};
    public allPrograms: SysProg[] = [];

    constructor(programs: SysProg[] = []) {
        this.allPrograms = programs;
        programs
            .filter(program => program.status === 'ACTIVE')
            .forEach(program => {
                const { arrangementType, arrangementId, reason } = program;
                if (arrangementType) {
                    if (!this.systematicProgramsByType[arrangementType]) {
                        this.systematicProgramsByType[arrangementType] = [];
                    }
                    this.systematicProgramsByType[arrangementType].push(program);
                }

                if (reason) {
                    this.systematicProgramById[reason] = program;
                }

                if (arrangementId) {
                    this.systematicProgramById[arrangementId] = program;
                }
            });
    }

    public getProgramsById(programId: string): SysProg | undefined {
        if (!programId) {
            return;
        }
        return this.systematicProgramById[programId];
    }

    public getProgramsByReason(reasonId: Reason): SysProg | undefined {
        if (!reasonId) {
            return;
        }
        return this.systematicProgramById[reasonId];
    }

    public getProgramsByType(arrangementType: ArrangementType | TempAnnuityArrangementTypes): SysProg[] {
        if (!arrangementType) {
            return [];
        }
        return this.systematicProgramsByType[arrangementType] ?? [];
    }

    // Grabs the program with the closest future nextProgramDate.  Returns undefined if no future program is found
    public getNextProgramByType(arrangementType: ArrangementType): SysProg | undefined {
        if (!arrangementType) {
            return;
        }
        return this.getProgramsByType(arrangementType)?.reduce((acc, sysProg) => {
            let sysProgDate;
            let accDate;
            if (sysProg.nextProgramDate) {
                sysProgDate = dayjs(sysProg.nextProgramDate, ZAHARA_API_DATE_FORMAT);
                if (sysProgDate.isBefore(dayjs())) {
                    sysProgDate = undefined;
                }
            }
            if (acc?.nextProgramDate) {
                accDate = dayjs(acc.nextProgramDate, ZAHARA_API_DATE_FORMAT);
            }
            if (!accDate) {
                return sysProg;
            }
            if (!sysProgDate) {
                return acc;
            }
            if (sysProgDate.isBefore(accDate)) {
                return sysProg;
            }
            return acc;
        }, undefined as SysProg | undefined);
    }

    public get all(): SysProg[] {
        return this.allPrograms;
    }
}
