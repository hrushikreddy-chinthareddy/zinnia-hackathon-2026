import { SswUpdateType } from '@deps/components/ssw-edit/ssw-edit-helpers';
import {
    BankUpdateType,
    SpecialProgramType,
    SswUpdateOption,
} from '@deps/models/case/enums';
import { ManagementTask } from '@deps/models/case/task-instance';

const TAX_WITHHOLDING_UPDATE = 'TaxWithholdingUpdate';
const EFT_DRAW_PROGRAM_TYPE = 'EFT Draw';

type ProgramLike = { programType?: string };

function mapProgramsToUpdateOption(
    programs: ProgramLike[] | null | undefined
): SswUpdateOption | null {
    if (!Array.isArray(programs) || programs.length === 0) return null;

    if (programs.some((p) => p?.programType === SpecialProgramType.SSW)) {
        return SswUpdateOption.SSW_UPDATE;
    }
    if (programs.some((p) => p?.programType === SpecialProgramType.RMD)) {
        return SswUpdateOption.RMD_UPDATE;
    }
    if (
        programs.some(
            (p) =>
                p?.programType === SpecialProgramType.EFT ||
                p?.programType === EFT_DRAW_PROGRAM_TYPE
        )
    ) {
        return SswUpdateOption.EFT_DRAW_UPDATE;
    }
    return null;
}

/**
 * Returns the update type for the task based on formUpdateData.
 * Maps backend updateType and programType to SswUpdateOption for display/routing.
 */
export function getUpdateType(task: ManagementTask): SswUpdateOption | null {
    const formUpdateData = task?.data?.formRequest?.formUpdateData;
    const updateType = formUpdateData?.updateType;

    if (!updateType) return null;
    if (updateType === TAX_WITHHOLDING_UPDATE) {
        return SswUpdateOption.WITHHOLDING_UPDATE;
    }
    if (
        updateType === BankUpdateType.BankUpdate ||
        updateType === BankUpdateType.BankTerminate
    ) {
        return SswUpdateOption.BANK_UPDATE;
    }
    if (updateType === SswUpdateType.PROGRAM_UPDATE) {
        return mapProgramsToUpdateOption(formUpdateData.programs);
    }
    if (updateType === SswUpdateType.PROGRAM_TERMINATE) {
        return SswUpdateOption.PROGRAM_TERMINATE;
    }

    return null;
}
