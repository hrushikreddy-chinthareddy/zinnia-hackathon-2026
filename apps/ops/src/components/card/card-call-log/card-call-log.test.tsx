import { render, screen } from '@testing-library/react';

import { toSentenceCase } from '@deps/helpers/string.helpers';

import CallLogCard from './card-call-log';

const testProps = {
    callerName: 'Inigo Montoya',
    callerRole: 'Boss',
    tag: 'Revenge Revenge',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    summary: 'My name is Inigo Montoya, you killed my father, prepare to die',
};

describe('CallLogCard', () => {
    it('renders the CallLogCard with provided props', () => {
        render(<CallLogCard {...testProps} />);

        expect(screen.getByText(`${testProps.callerName},`)).toBeInTheDocument();
        expect(screen.getByText(testProps.callerRole)).toBeInTheDocument();
        expect(screen.getByText(toSentenceCase(testProps.tag))).toBeInTheDocument();
        expect(screen.getByText(testProps.summary)).toBeInTheDocument();
    });

    it('renders no summary card when there is no summary provided', () => {
        render(<CallLogCard {...testProps} summary={undefined} />);

        expect(screen.getByText('sideSheet.noCallLogSummary')).toBeInTheDocument();
    });

    it('renders the caller name correctly when missing a caller role', () => {
        render(<CallLogCard {...testProps} callerRole={undefined} />);

        expect(screen.getByText(`${testProps.callerName}`)).toBeInTheDocument();
    });
});
