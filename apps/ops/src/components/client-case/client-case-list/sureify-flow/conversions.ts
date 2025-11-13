import { UnderwritingClass } from '@deps/components/illustrations/helpers/illustrationApiSchemas';
import { NEW_BUSINESS_API_ORIGIN } from '@deps/queries/api/server/v2/new-business';
import { throwTypedError } from '@deps/queries/api-utils/throwTypedError';
import {
    IllustrationInsuredDetails,
    IllustrationsClientCase,
    TransactionType,
} from '@deps/types/illustrations';
import {
    isConversionPolicyHistoryItem,
    NewBusiness,
} from '@deps/types/new-business';

import { validateRequiredFields } from './validate-required-fields';

const inferNicotineUse = (underwritingClass?: UnderwritingClass) => {
    if (!underwritingClass) {
        return;
    }

    if (underwritingClass.endsWith('NONTOBACCO')) {
        return false;
    }

    if (underwritingClass.endsWith('TOBACCO')) {
        return true;
    }

    return false;
};

export const validateConversionPayload = (
    payload: Partial<IllustrationsClientCase>
) => {
    const missingFields = validateRequiredFields(payload.insuredDetails, {
        sexAtBirth: 'Insured sex at birth',
        underwritingClass: 'Insured risk class',
        state: 'State',
        dateOfBirth: 'Date of birth',
    } satisfies Partial<Record<keyof IllustrationInsuredDetails, string>>);

    if (missingFields.length) {
        throwTypedError(
            `There are missing insured required fields: ${missingFields.join(
                ', '
            )}`,
            NEW_BUSINESS_API_ORIGIN
        );
    }
};

export const buildConversionData = ({
    application,
    policy,
    underwriting,
}: NewBusiness): Partial<IllustrationsClientCase> => {
    const conversionItem = application?.policyHistory?.find(
        isConversionPolicyHistoryItem
    );
    const isConversion = conversionItem != null;

    if (!isConversion) {
        return {};
    }

    const underwritingClass = underwriting?.decisionRiskClass;

    return {
        transactionType: conversionItem?.type as TransactionType,
        isMec: conversionItem?.mecIndicator ?? false,
        originalFaceAmount: policy?.coverage?.faceAmount,
        insuredDetails: {
            underwritingClass,
            nicotineUser: inferNicotineUse(underwritingClass),
        },
    };
};
