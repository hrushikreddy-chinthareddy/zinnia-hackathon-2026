import { render, screen } from '@testing-library/react';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { mockPolicy } from '@deps/services/mocks/sor-policy-iul';

import PolicyDetailsHeader from './policy-details-header';

describe('<PolicyDetailsHeader/>', () => {
    it('renders a title', () => {
        render(<PolicyDetailsHeader policy={new PolicyDetails(mockPolicy)} />);
        expect(screen.getByText(/policyDetails/i)).toBeInTheDocument();
    });

    it('will render a child component', () => {
        render(
            <PolicyDetailsHeader
                policy={new PolicyDetails(mockPolicy)}
                belowHeaderTextChildren={<div>yolo</div>}
            />
        );
        expect(screen.getByText(/yolo/i)).toBeInTheDocument();
    });
});
