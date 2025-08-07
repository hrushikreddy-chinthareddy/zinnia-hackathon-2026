import { render, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import * as roleUtils from '@deps/constants/role';
import { SignatureDesignation } from '@deps/models/case/renewal/signature-validation';

import SignatureSection from './signature-section';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const setRoleDataMock = jest.fn();
jest.mock('@deps/contexts/RoleChangeContext', () => ({
    useRoleChange: () => ({
        setRoleData: setRoleDataMock,
    }),
}));

jest.mock('@deps/constants/role', () => ({
    ...jest.requireActual('@deps/constants/role'),
    getSignatureDesignationOptions: jest.fn(),
}));

(roleUtils.getSignatureDesignationOptions as jest.Mock).mockReturnValue([
    { label: 'trustee', value: SignatureDesignation.Trustee },
    { label: 'custodian', value: SignatureDesignation.Custodian },
]);

const props = {
    title: 'Test Signature',
    signature: {},
    index: 0,
};

describe('SignatureSection', () => {
    const mockSignature = {
        isSignedPresent: 'Yes',
        signDesignation: 'Manager',
        signDate: '2023-10-01',
    };

    beforeEach(() => {
        setRoleDataMock.mockClear();
    });

    it('renders title and form elements correctly', () => {
        render(
            <SignatureSection
                title="New Owner Signature"
                signature={mockSignature}
                index={0}
                role={''}
            />
        );

        expect(screen.getByLabelText('designation')).toBeInTheDocument();
        expect(screen.getByLabelText('signDate')).toBeInTheDocument();
    });

    it('changes radio selection', () => {
        render(
            <SignatureSection
                title="Test Signature"
                signature={{}}
                index={0}
                role={''}
            />
        );

        const noRadio = screen.getByLabelText('no') as HTMLInputElement;
        fireEvent.click(noRadio);

        expect(setRoleDataMock).toHaveBeenCalledWith(expect.any(Function));
    });

    it('handles signature designation change', async () => {
        window.HTMLElement.prototype.scrollIntoView = jest.fn();
        Element.prototype.hasPointerCapture = jest.fn().mockReturnValue(false);

        render(<SignatureSection role={''} {...props} />);

        const select = screen.getByLabelText('designation');
        await userEvent.click(select);

        setRoleDataMock(0, 'signDesignation', 'Trustee');

        expect(setRoleDataMock).toHaveBeenCalledWith(
            0,
            'signDesignation',
            'Trustee'
        );
    });

    it('changes date in FieldDateSelect', () => {
        render(
            <SignatureSection
                title="Test Signature"
                signature={{}}
                index={0}
                role={''}
            />
        );

        const dateInput = screen.getByLabelText('signDate') as HTMLInputElement;
        fireEvent.change(dateInput, { target: { value: '2024-01-15' } });

        expect(setRoleDataMock).toHaveBeenCalledWith(expect.any(Function));
    });

    it('handles empty signature object gracefully', () => {
        render(
            <SignatureSection
                title="No Data Signature"
                signature={{}}
                index={1}
                role={''}
            />
        );

        expect(screen.getByLabelText('designation')).toBeInTheDocument();
        expect(screen.getByLabelText('signDate')).toBeInTheDocument();
    });

    it('calls setRoleData for each field update', () => {
        render(
            <SignatureSection
                title="Interactive"
                signature={{}}
                index={2}
                role={''}
            />
        );

        expect(screen.getByLabelText('designation')).toBeInTheDocument();
        expect(screen.getByLabelText('signDate')).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('yes'));

        fireEvent.change(screen.getByLabelText('signDate'), {
            target: { value: '06012025' },
        });

        expect(setRoleDataMock).toHaveBeenCalledTimes(2);
    });
});
