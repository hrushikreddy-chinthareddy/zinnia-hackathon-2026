import { render, screen } from '@testing-library/react';

import { PROCESS_WITHOUT_CASE_DOCUMENT } from '@deps/components/case-document-select/case-document-select';
import { NOOP } from '@deps/types/constants';

import CardCaseDocument from './card-case-document';

jest.mock('@deps/utils/server-logging');

const mockT = (key: string, values?: Record<string, string>) => {
    if (values) {
        return `${key} ${Object.values(values).join(', ')}`;
    }
    return key;
};

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
    }),
}));

describe('CardCaseDocument', () => {
    test('renders document number and tag', () => {
        const caseDocumentOption = {
            caseId: 'CA0000403507',
            documentNumber: '12345-AB-67890',
            tag: 'Developer',
            value: '12345-AB-67890',
        };

        render(
            <CardCaseDocument
                caseDocumentOption={caseDocumentOption}
                isSelected={false}
                index={0}
                onChange={NOOP}
            />
        );
        expect(screen.getByText(caseDocumentOption.tag)).toBeInTheDocument();
        expect(
            screen.getByText('workflows.start.documentNumber')
        ).toBeInTheDocument();
        expect(screen.getByText('12345-AB-67890')).toBeInTheDocument();
        expect(screen.getByText('CA0000403507')).toBeInTheDocument();
    });

    test('renders proper copy for process without document', () => {
        const caseDocumentOption = {
            documentNumber: 'Process without document',
            value: PROCESS_WITHOUT_CASE_DOCUMENT,
            caseId: '',
        };

        render(
            <CardCaseDocument
                caseDocumentOption={caseDocumentOption}
                isSelected={false}
                index={0}
                onChange={NOOP}
            />
        );
        expect(
            screen.getByText('Process without document')
        ).toBeInTheDocument();
    });
});
