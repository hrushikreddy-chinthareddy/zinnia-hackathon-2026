import { fireEvent, render, waitFor } from '@testing-library/react';

import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import {
    DislikeReasonsPayload,
    OpsIntakeFormPayload,
} from '@deps/types/knowledge-base';

import OpsIntakeForm from './ops-intake-form';

const defaultDislikeReason: DislikeReasonsPayload = {
    reason: 'infoMissing',
    links: null,
    metadata: null,
};

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

describe('OpsIntakeForm', () => {
    let setMetadata: jest.Mock;
    let onDislikeReasonChange: jest.Mock;
    let onClose: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'warn').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
        onClose = jest.fn();
        setMetadata = jest.fn();
        onDislikeReasonChange = jest.fn();
    });

    it('renders all fields and priority radios', () => {
        const { getAllByPlaceholderText, getByLabelText } = render(
            <OpsIntakeForm
                metadata={{} as OpsIntakeFormPayload}
                onClose={onClose}
                dislikeReason={defaultDislikeReason}
                setMetadata={setMetadata}
                onDislikeReasonChange={onDislikeReasonChange}
            />
        );

        const fields = getAllByPlaceholderText('opsIntakeForm.placeholder');
        fields.forEach((field) => expect(field).toBeInTheDocument());

        expect(getByLabelText('Low')).toBeInTheDocument();
        expect(getByLabelText('Medium')).toBeInTheDocument();
        expect(getByLabelText('High')).toBeInTheDocument();
        expect(getByLabelText('Critical')).toBeInTheDocument();
    });

    it('closes the ops intake form and clears metadata when cancel button click', () => {
        const { getByLabelText } = render(
            <OpsIntakeForm
                metadata={{} as OpsIntakeFormPayload}
                onClose={onClose}
                dislikeReason={defaultDislikeReason}
                setMetadata={setMetadata}
                onDislikeReasonChange={onDislikeReasonChange}
            />
        );

        const cancelBtn = getByLabelText('cancel-ops-form');
        fireEvent.click(cancelBtn);

        expect(setMetadata).toHaveBeenCalledWith({});
        expect(onClose).toHaveBeenCalledWith();
    });

    it('submit button is disabled when form is invalid', () => {
        const { getByLabelText } = render(
            <OpsIntakeForm
                metadata={{} as OpsIntakeFormPayload}
                onClose={onClose}
                dislikeReason={defaultDislikeReason}
                setMetadata={setMetadata}
                onDislikeReasonChange={onDislikeReasonChange}
            />
        );

        const submitBtn = getByLabelText(
            'submit-ops-form'
        ) as HTMLButtonElement;
        expect(submitBtn.disabled).toBe(true);
    });

    it('submits form when valid and calls metadata & onDislikeReasonChange', async () => {
        const { getByLabelText } = render(
            <OpsIntakeForm
                metadata={{} as OpsIntakeFormPayload}
                onClose={onClose}
                dislikeReason={defaultDislikeReason}
                setMetadata={setMetadata}
                onDislikeReasonChange={onDislikeReasonChange}
            />
        );

        fireEvent.change(getByLabelText('opsIntakeForm.processName'), {
            target: { value: 'Process 1' },
        });
        fireEvent.change(getByLabelText('opsIntakeForm.blockOfBusiness'), {
            target: { value: 'Business Block' },
        });
        fireEvent.change(getByLabelText('opsIntakeForm.processDescription'), {
            target: { value: 'Description' },
        });
        fireEvent.change(getByLabelText('opsIntakeForm.outcomeExpected'), {
            target: { value: 'Outcome' },
        });
        fireEvent.change(getByLabelText('opsIntakeForm.smeEmail'), {
            target: { value: 'sme.email@zinnia.com' },
        });
        fireEvent.change(getByLabelText('Low'), { target: { value: 'Low' } });
        fireEvent.change(getByLabelText('Daily'), {
            target: { value: 'Daily' },
        });
        fireEvent.change(getByLabelText('opsIntakeForm.benefitMetrics'), {
            target: { value: 'Benefit Metrics' },
        });

        const submitBtn = getByLabelText('submit-ops-form');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(setMetadata).toHaveBeenCalled();
            expect(onDislikeReasonChange).toHaveBeenCalled();
            expect(onClose).toHaveBeenCalledWith();
        });
    });

    it('updates priority when radio option is selected', () => {
        const { getByLabelText } = render(
            <OpsIntakeForm
                metadata={{} as OpsIntakeFormPayload}
                onClose={onClose}
                dislikeReason={defaultDislikeReason}
                setMetadata={setMetadata}
                onDislikeReasonChange={onDislikeReasonChange}
            />
        );

        const mediumRadio = getByLabelText('Medium') as HTMLInputElement;
        fireEvent.click(mediumRadio);
        expect(mediumRadio.checked).toBe(true);
    });
});
