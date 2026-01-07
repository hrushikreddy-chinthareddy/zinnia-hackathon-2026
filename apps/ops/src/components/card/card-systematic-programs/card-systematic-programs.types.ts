import {
    ArrangementType,
    SystematicProgram,
} from '@zinnia/api-types/types/sor';

import { FooterContent } from '../card-section/card-section';

export interface SystematicProgramsDetails {
    arrangementType: ArrangementType;
    activePrograms: SystematicProgram[];
    terminatedOrSuspendedPrograms: SystematicProgram[];
    manageAction?: FooterContent;
    cancelAction?: FooterContent;
}

export interface SystematicProgramsCardProps {
    programs: SystematicProgramsDetails[];
    setUpAction?: FooterContent;
    isLife?: boolean;
}

export interface SystematicProgramsActiveTableProps {
    programs: SystematicProgramsDetails[];
    hasActivePrograms: boolean;
    isLife?: boolean;
}
export interface SystematicProgramsTerminatedTableProps {
    programs: SystematicProgramsDetails[];
    hasTerminatedOrSuspendedPrograms: boolean;
    showTerminatedOrSuspended: boolean;
}

export enum SystematicProgramsCardTest {
    CONTAINER = 'systematic-programs-card-container-test-id',
}
