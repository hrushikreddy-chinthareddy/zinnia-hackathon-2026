import { render, screen } from '@testing-library/react';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { mockPolicy } from '@deps/jest/data/mockPolicy';

import BaseCoverageCard from './base-coverage-card';

jest.mock('@deps/utils/server-logging');

describe('BaseCoverageCard', () => {
    it('should render the component with base coverage data', () => {
        const clonedPolicy = { ...mockPolicy };

        if (clonedPolicy.coverage?.coverageLayers?.[0]) {
            clonedPolicy.coverage.coverageLayers[0].coverageChangeEffectiveDate =
                '2022-01-01';
            clonedPolicy.coverage.coverageLayers[0].currentAmount = 100000;
            clonedPolicy.coverage.coverageLayers[0].originalCoverageAmount = 200000;
        }

        render(
            <BaseCoverageCard policyDetails={new PolicyDetails(clonedPolicy)} />
        );

        expect(screen.getByText('$100,000.00')).toBeInTheDocument();
        expect(screen.getByText('$200,000.00')).toBeInTheDocument();
        expect(screen.getByText('1/1/2022')).toBeInTheDocument();
    });

    it('should display the base death benefit value', () => {
        const clonedPolicy = { ...mockPolicy };

        if (clonedPolicy.coverage?.coverageLayers?.[0]) {
            clonedPolicy.coverage.coverageLayers[0].coverageChangeEffectiveDate =
                '2022-01-01';
            clonedPolicy.coverage.coverageLayers[0].currentAmount = 100000;
            clonedPolicy.coverage.coverageLayers[0].originalCoverageAmount = 200000;
        }

        render(
            <BaseCoverageCard policyDetails={new PolicyDetails(clonedPolicy)} />
        );

        expect(screen.getByText('$100,000.00')).toBeInTheDocument();
    });

    it('should display the original death benefit value if coverageChangeEffectiveDate exists', () => {
        const clonedPolicy = { ...mockPolicy };

        if (clonedPolicy.coverage?.coverageLayers?.[0]) {
            clonedPolicy.coverage.coverageLayers[0].coverageChangeEffectiveDate =
                '2022-01-01';
            clonedPolicy.coverage.coverageLayers[0].currentAmount = 100000;
            clonedPolicy.coverage.coverageLayers[0].originalCoverageAmount = 200000;
        }

        render(
            <BaseCoverageCard policyDetails={new PolicyDetails(clonedPolicy)} />
        );

        expect(screen.getByText('$200,000.00')).toBeInTheDocument();
    });

    it('should not display the original death benefit value and last coverage change date if coverageChangeEffectiveDate does not exist', () => {
        const clonedPolicy = { ...mockPolicy };

        if (clonedPolicy.coverage?.coverageLayers?.[0]) {
            clonedPolicy.coverage.coverageLayers[0].coverageChangeEffectiveDate =
                undefined;
            clonedPolicy.coverage.coverageLayers[0].currentAmount = 100000;
            clonedPolicy.coverage.coverageLayers[0].originalCoverageAmount = 200000;
        }

        render(
            <BaseCoverageCard policyDetails={new PolicyDetails(clonedPolicy)} />
        );

        expect(screen.queryByText('$200,000.00')).not.toBeInTheDocument();
        expect(screen.queryByText('1/1/2022')).not.toBeInTheDocument();
    });

    it('should display the last coverage change date if coverageChangeEffectiveDate exists', () => {
        const clonedPolicy = { ...mockPolicy };

        if (clonedPolicy.coverage?.coverageLayers?.[0]) {
            clonedPolicy.coverage.coverageLayers[0].coverageChangeEffectiveDate =
                '2022-01-01';
            clonedPolicy.coverage.coverageLayers[0].currentAmount = 100000;
            clonedPolicy.coverage.coverageLayers[0].originalCoverageAmount = 200000;
        }

        render(
            <BaseCoverageCard policyDetails={new PolicyDetails(clonedPolicy)} />
        );

        expect(screen.getByText('1/1/2022')).toBeInTheDocument();
    });
});
