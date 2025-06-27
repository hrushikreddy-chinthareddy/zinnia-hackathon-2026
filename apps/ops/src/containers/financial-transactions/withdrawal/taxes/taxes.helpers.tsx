import {
    TaxRateToUse,
    TaxWithholdingInstructions,
    TaxWithholdingType,
} from '@zinnia/api-types/types/bpm';
import { PartyRole, Policy } from '@zinnia/api-types/types/sor';

import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

export interface Errors {
    federalBothCheckboxes?: boolean;
    federalBothInputs?: boolean;
    federalNothing?: boolean;
    stateBothCheckboxes?: boolean;
    stateBothInputs?: boolean;
    stateNothing?: boolean;
}

interface TaxWithholdingViewModel {
    dollarAmount?: string;
    percentAmount?: string;
    withholdMinimum?: boolean;
    withholdNone?: boolean;
}

export const getFormErrors = (
    federalTaxWithholdings: TaxWithholdingViewModel,
    stateTaxWithholdings: TaxWithholdingViewModel
) => {
    let errors: Errors = {};

    if (
        !federalTaxWithholdings.percentAmount &&
        !federalTaxWithholdings.dollarAmount &&
        !federalTaxWithholdings.withholdMinimum &&
        !federalTaxWithholdings.withholdNone
    ) {
        errors = { ...errors, federalNothing: true };
    }

    if (
        federalTaxWithholdings.percentAmount &&
        federalTaxWithholdings.dollarAmount &&
        !(
            federalTaxWithholdings.withholdMinimum ||
            federalTaxWithholdings.withholdNone
        )
    ) {
        errors = { ...errors, federalBothInputs: true };
    }

    if (
        federalTaxWithholdings.withholdMinimum &&
        federalTaxWithholdings.withholdNone
    ) {
        errors = { ...errors, federalBothCheckboxes: true };
    }

    if (
        !stateTaxWithholdings.percentAmount &&
        !stateTaxWithholdings.dollarAmount &&
        !stateTaxWithholdings.withholdMinimum &&
        !stateTaxWithholdings.withholdNone
    ) {
        errors = { ...errors, stateNothing: true };
    }

    if (
        stateTaxWithholdings.percentAmount &&
        stateTaxWithholdings.dollarAmount &&
        !(
            stateTaxWithholdings.withholdMinimum ||
            stateTaxWithholdings.withholdNone
        )
    ) {
        errors = { ...errors, stateBothInputs: true };
    }

    if (
        stateTaxWithholdings.withholdMinimum &&
        stateTaxWithholdings.withholdNone
    ) {
        errors = { ...errors, stateBothCheckboxes: true };
    }

    return errors;
};

const getTaxRateToUse = (taxWithholding: TaxWithholdingViewModel) => {
    if (taxWithholding.withholdMinimum) {
        return TaxRateToUse.USEDEFAULTTABLE;
    }

    if (taxWithholding.withholdNone) {
        return TaxRateToUse.NOWITHHOLDINGELECTED;
    }

    return TaxRateToUse.USEVALUESENTERED;
};

export const mapTaxWithholdingInstructionsFromViewModel = (
    viewModel: TaxWithholdingViewModel,
    withholdingType: TaxWithholdingType
): TaxWithholdingInstructions => {
    const taxRateToUse = getTaxRateToUse(viewModel);

    return {
        exemptions: 0,
        // We do not want to set these values if one of the checkboxes is selected
        dollar:
            taxRateToUse === TaxRateToUse.USEVALUESENTERED &&
            !isNullEmptyOrUndefined(viewModel.dollarAmount)
                ? Number(viewModel.dollarAmount)
                : 0,
        percentage:
            taxRateToUse === TaxRateToUse.USEVALUESENTERED &&
            !isNullEmptyOrUndefined(viewModel.percentAmount)
                ? Number(viewModel.percentAmount)
                : 0,
        taxRateToUse,
        taxWithholdingType: withholdingType,
    };
};

export const mapTaxWithholdingInstructionsToViewModel = (
    taxWithholdings?: TaxWithholdingInstructions
): TaxWithholdingViewModel => {
    if (!taxWithholdings) {
        return {};
    }

    return {
        dollarAmount: taxWithholdings.dollar
            ? String(taxWithholdings.dollar)
            : '',
        percentAmount: taxWithholdings.percentage
            ? String(taxWithholdings.percentage)
            : '',
        withholdMinimum:
            taxWithholdings.taxRateToUse === TaxRateToUse.USEDEFAULTTABLE,
        withholdNone:
            taxWithholdings.taxRateToUse === TaxRateToUse.NOWITHHOLDINGELECTED,
    };
};

export const getOwnersTaxJurisdictionState = (policy: Policy): string => {
    const policyOwnerId = policy?.partyRoles?.find(
        (pr) => pr.partyRole === PartyRole.OWNER
    )?.partyId;
    const policyOwner = policy?.parties?.find(
        (party) => party.partyId === policyOwnerId
    );
    const ownerTaxJurisdiction = policyOwner?.taxWithholdings?.find(
        (tw) => tw.taxWithholdingType === TaxWithholdingType.STATE
    )?.taxJurisdiction;

    return ownerTaxJurisdiction?.split('_')?.length === 2
        ? ownerTaxJurisdiction?.split('_')[1]
        : DEFAULT_ERROR_STRING;
};
