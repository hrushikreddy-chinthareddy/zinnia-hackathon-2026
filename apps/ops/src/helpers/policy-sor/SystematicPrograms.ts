import dayjs from 'dayjs';

import { ArrangementType, SystematicProgram as SysProg } from '@deps/models/policy/sor-policy';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

export class SystematicPrograms {
    public systematicProgramById: Record<string, SysProg> = {};
    public systematicProgramsByType: Record<string, SysProg[]> = {};
    public allPrograms: SysProg[] = [];

    constructor(programs: SysProg[] = []) {
        this.allPrograms = programs;
        programs.forEach(program => {
            const { arrangementType, arrangementId } = program;
            if (arrangementType) {
                if (!this.systematicProgramsByType[arrangementType]) {
                    this.systematicProgramsByType[arrangementType] = [];
                }
                this.systematicProgramsByType[arrangementType].push(program);
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

    public getProgramsByType(arrangementType: ArrangementType): SysProg[] {
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
