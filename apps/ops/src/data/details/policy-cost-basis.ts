import { Policy } from '@zinnia/api-types/types/sor';

import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { DataDefinition } from '@deps/types/data';

export interface CostBasisDto {
    costBasisDate?: string;
    costBasis?: number;
}
export const toCostBasisDto = ({ costBasis }: Policy): CostBasisDto => {
    return {
        costBasisDate: costBasis?.costBasisDate,
        costBasis: costBasis?.costBasis,
    };
};
export const CostBasisInfo = (): DataDefinition<CostBasisDto>[] => [
    {
        key: 'costBasisDate',
        label: 'Cost Basis Date',
    },
    {
        key: 'costBasis',
        label: 'Cost Basis',
        format: numberFormatify,
    },
];
