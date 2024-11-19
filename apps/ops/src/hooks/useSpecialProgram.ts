import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';

import { ActiveWithdrawalCase, SpecialProgram } from '@deps/models/case/withdrawal/case';
import { getSpecialPrograms } from '@deps/queries/api/policies';

export const useSpecialProgram = (initialForm: ActiveWithdrawalCase) => {
    const [isLoading, setIsLoading] = useState(false);

    const [activePrograms, setActivePrograms] = useState<SpecialProgram[] | null>([]);

    const ProgramType = {
        PremiumDefault: 0,
        SSW: 2,
        RMD: 4,
        SSWNet: 6,
    };

    const getPrograms = useCallback(async () => {
        try {
            setIsLoading(true);
            setActivePrograms([]);
            const spcialProgramdetails = await getSpecialPrograms(initialForm.data.contractNum, initialForm.carrier);
            const activeProg =
                spcialProgramdetails?.allocationDetails?.filter(
                    program =>
                        [ProgramType.PremiumDefault, ProgramType.RMD, ProgramType.SSW, ProgramType.SSWNet].includes(program.typeOfAlloc) &&
                        (program.termDate === '' || dayjs().isBefore(program.termDate))
                ) || null;
            setActivePrograms(activeProg);
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
            console.error('GetRMDSpecialPrograms::Error retrieving special program list', e);
        }
    }, [initialForm]);

    useEffect(() => {
        getPrograms();
    }, [getPrograms]);

    return { activePrograms, isLoading };
};
