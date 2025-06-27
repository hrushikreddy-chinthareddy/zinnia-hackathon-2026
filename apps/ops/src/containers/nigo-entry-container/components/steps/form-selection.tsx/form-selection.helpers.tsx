import { Carrier } from '@deps/models/case/withdrawal/case';

export const getFormSelectionConfig = (clientCode: string) => {
    const isFormIdRequired = clientCode !== Carrier.MASS;

    return {
        isFormIdRequired,
    };
};
