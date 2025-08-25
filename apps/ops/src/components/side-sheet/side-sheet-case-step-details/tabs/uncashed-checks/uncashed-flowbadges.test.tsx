import { render, screen } from '@testing-library/react';
import { TFunction } from 'next-i18next';

import { UncashedTransactionStatus } from '../transactions-step-additional-data.types';
import { UncashedFlowBadges } from './uncashed-flowbadges';

const mockT: TFunction = (key: any) => key;

describe('##UncashedFlowBadges', () => {
    it('#should render the component with correct structure', () => {
        render(
            <UncashedFlowBadges
                currentStatus={UncashedTransactionStatus.OUTSTANDING}
                isPostDeath={false}
                t={mockT}
                transactionId="1"
            />
        );

        expect(
            screen.getByText('transactionListing.labels.outstanding')
        ).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.labels.stopped')
        ).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.labels.checkToEstate')
        ).toBeInTheDocument();
    });

    it('#should apply correct container classes', () => {
        const { container } = render(
            <UncashedFlowBadges
                currentStatus={UncashedTransactionStatus.OUTSTANDING}
                isPostDeath={false}
                t={mockT}
                transactionId="1"
            />
        );

        const flowContainer = container.firstChild as HTMLElement;
        expect(flowContainer).toHaveClass('flex', 'items-center', 'mt-2');
    });

    it('#should render correct steps for pre-death flow', () => {
        render(
            <UncashedFlowBadges
                currentStatus={UncashedTransactionStatus.OUTSTANDING}
                isPostDeath={false}
                t={mockT}
                transactionId="1"
            />
        );

        expect(
            screen.getByText('transactionListing.labels.outstanding')
        ).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.labels.stopped')
        ).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.labels.checkToEstate')
        ).toBeInTheDocument();
        expect(
            screen.queryByText('transactionListing.labels.reversed')
        ).not.toBeInTheDocument();
    });

    it('#should render correct steps for post-death flow', () => {
        render(
            <UncashedFlowBadges
                currentStatus={UncashedTransactionStatus.OUTSTANDING}
                isPostDeath={true}
                t={mockT}
                transactionId="1"
            />
        );

        expect(
            screen.getByText('transactionListing.labels.outstanding')
        ).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.labels.stopped')
        ).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.labels.reversed')
        ).toBeInTheDocument();
        expect(
            screen.queryByText('transactionListing.labels.checkToEstate')
        ).not.toBeInTheDocument();

        const outstandingBadge = screen.getByTestId(
            'trans-badge-outstanding-1'
        );
        expect(outstandingBadge).toHaveClass('text-semantic-pending');
    });

    it('#should render correct steps for post-death flow', () => {
        render(
            <UncashedFlowBadges
                currentStatus={UncashedTransactionStatus.REVERSED}
                isPostDeath={true}
                t={mockT}
                transactionId="1"
            />
        );

        expect(
            screen.getByText('transactionListing.labels.outstanding')
        ).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.labels.stopped')
        ).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.labels.reversed')
        ).toBeInTheDocument();
        expect(
            screen.queryByText('transactionListing.labels.checkToEstate')
        ).not.toBeInTheDocument();
    });
});
