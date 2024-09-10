import { mockPolicy } from '@deps/jest/data/mockPolicy';
import { Policy } from '@deps/models/policy/sor-policy';

import { mapCoverageData } from './coverage-sub-page.helper';

const tSpy = jest.fn(str => str);

describe('mapCoverageData', () => {
    it('should return the expected data', () => {
        const result = mapCoverageData(mockPolicy as Policy, tSpy);

        expect(result).toEqual({
            coverage: result.coverage,
            currency: result.currency,
            deathBenefit: result.deathBenefit,
            insured: {
                ageAtIssue: 'policy.detailCards.insured.nYearsOld',
                currentAge: 'policy.detailCards.insured.nYearsOld',
                fullName: {
                    href: '/policies/SBFIXUL1/AU29035902/people/Party_PI_1',
                    text: 'John Doe',
                },
                riskClass: 'people.card.underwritingInfo.riskClassOptions.preferredNonTobacco',
            },
            contestability: {
                endDate: '3/27/2025',
                startDate: '3/28/2023',
            },
            netAmountAtRisk: 249939,
            planCode: 'SBFIXUL1',
        });
    });
});
