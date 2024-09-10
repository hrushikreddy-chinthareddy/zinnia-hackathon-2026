import { numberFormatify } from '@deps/helpers/numbers.helper';
import { Policy } from '@deps/models/policy/sor-policy';
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
