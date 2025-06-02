import { faker } from '@faker-js/faker';
import { FlatExtra, FlatExtraType } from '@zinnia/api-types/types/sor';

import { AdditionalCharge } from '@deps/components/card/card-transactions/card-transactions';

export const generatePolicyValue = (costBasis: number) => {
    return {
        beginningAcctValue: faker.number.float({ min: 0, max: costBasis }),
        endingAcctValue: 1,
        minRequiredAcctValue: 0,
        acctValueByPolicyYear: 0,
        unloanedPortionOfAcctValue: 32.34626,
        loanedPortionOfAcctValue: 0,
        surrenderValue: 32.34626,
        netAmountAtRisk: 249939,
        initialPremiumRequestAmount: costBasis,
        initialPremiumAppliedAmount: costBasis,
        cumulativePremSinceIssue: costBasis,
    };
};

export const generateFlatExtra = (): FlatExtra => ({
    flatExtraAmount: faker.number.int({
        min: 10,
    }),
    flatExtraDuration: faker.number.int({
        min: 15,
    }),
    flatExtraStartDate: `${faker.date.past()}`,
    flatExtraType: faker.helpers.arrayElement(Object.keys(FlatExtraType)) as FlatExtraType,
});

export const generateAdditionalCharges = (x: number, tooltips = false) =>
    Array(x)
        .fill(x)
        .map(
            (): AdditionalCharge => ({
                key: faker.string.uuid(),
                label: faker.lorem.word(),
                tooltipTitle: tooltips ? faker.lorem.word() : undefined,
                tooltipBody: tooltips ? faker.lorem.words() : undefined,
                amount:
                    faker.number.int({
                        min: 1,
                        max: 10,
                    }) * 10,
            })
        );
