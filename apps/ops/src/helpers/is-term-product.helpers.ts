import { ProductType } from '@zinnia/api-types/types/sor';

/**
 * Returns true if the given product type is TERM.
 */
export const isTermProduct = (type?: ProductType): boolean =>
    type === ProductType.TERM;
