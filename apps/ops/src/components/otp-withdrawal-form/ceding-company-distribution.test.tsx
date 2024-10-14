import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import { getQualTypeOptions } from '@deps/containers/otp/oft-forms/oft-form-helper';
import { FormDataContext, defaultFormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { ButtonGroupTest } from '@deps/jest/constants/test-id-constants';
import { mockT as t } from '@deps/setupTests';

import CedingCompanyDistribution from './ceding-company-distribution';


describe('#CedingCompanyDistribution component', () => {
    it('should render the corporate resolution and loa attached sections by default', () => {
        render(
            <FormDataContext.Provider value={{ ...defaultFormDataContext }}>
                <CedingCompanyDistribution
                    qualificationOptions={getQualTypeOptions(t)}
                    isFormStateReadOnly={false}
                />
            </FormDataContext.Provider>
        );

        const sectionTitle = screen.getByTestId('title');
        expect(sectionTitle).toBeInTheDocument();
        expect(sectionTitle.tagName).toBe('H3');

        expect(screen.getByText('cedingCompanySignature.qualType')).toBeInTheDocument();
        expect(screen.getByText('cedingCompanySignature.isQualTypeNotValid')).toBeInTheDocument();
        expect(screen.getByText('cedingCompanySignature.isSignatureValid')).toBeInTheDocument();
        expect(screen.getByText('cedingCompanySignature.isLoaAttached')).toBeInTheDocument();
        expect(screen.getByText('cedingCompanySignature.validOwnerRegType')).toBeInTheDocument();
        
    });

    it('should not render the corporate resolution and loa attached sections when render is false', () => {
        render(
            <FormDataContext.Provider value={{ ...defaultFormDataContext }}>
                <CedingCompanyDistribution
                    qualificationOptions={getQualTypeOptions(t)}
                    isFormStateReadOnly={false}
                    renderCorporateResolution={false}
                    renderIsLoaAttached={false}
                />
            </FormDataContext.Provider>
        );

        const sectionTitle = screen.getByTestId('title');
        expect(sectionTitle).toBeInTheDocument();
        expect(sectionTitle.tagName).toBe('H3');

        expect(screen.getByText('cedingCompanySignature.qualType')).toBeInTheDocument();
        expect(screen.getByText('cedingCompanySignature.isQualTypeNotValid')).toBeInTheDocument();
        expect(screen.queryByText('cedingCompanySignature.isSignatureValid')).not.toBeInTheDocument();
        expect(screen.queryByText('cedingCompanySignature.isLoaAttached')).not.toBeInTheDocument();
        expect(screen.getByText('cedingCompanySignature.validOwnerRegType')).toBeInTheDocument();
    });

    it('should show loa sign date only when line of agreement is attached', () => {
        render(
            <FormDataContext.Provider value={{ ...defaultFormDataContext }}>
                <CedingCompanyDistribution
                    qualificationOptions={getQualTypeOptions(t)}
                    isFormStateReadOnly={false}
                    renderCorporateResolution={false}
                    renderLoaDate={true}
                />
            </FormDataContext.Provider>
        );

        const sectionTitle = screen.getByTestId('title');
        expect(sectionTitle).toBeInTheDocument();
        expect(sectionTitle.tagName).toBe('H3');

        expect(screen.getByText('cedingCompanySignature.qualType')).toBeInTheDocument();
        expect(screen.queryByText('cedingCompanySignature.isLoaAttached')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId(`${ButtonGroupTest.LABEL}-${'yes'}`));
        expect(
            screen.getByRole('textbox', {
                name: /cedingcompanysignature\.loasigndate/i,
            })
        ).toBeInTheDocument();
    });

    it('should not show loa sign date when renderLoaDate is false', () => {
        render(
            <FormDataContext.Provider value={{ ...defaultFormDataContext }}>
                <CedingCompanyDistribution
                    qualificationOptions={getQualTypeOptions(t)}
                    isFormStateReadOnly={false}
                    renderCorporateResolution={false}
                    renderLoaDate={false}
                />
            </FormDataContext.Provider>
        );

        const sectionTitle = screen.getByTestId('title');
        expect(sectionTitle).toBeInTheDocument();
        expect(sectionTitle.tagName).toBe('H3');

        expect(screen.getByText('cedingCompanySignature.qualType')).toBeInTheDocument();
        expect(screen.queryByText('cedingCompanySignature.isLoaAttached')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId(`${ButtonGroupTest.LABEL}-${'yes'}`));
        expect(screen.queryByText('cedingCompanySignature.loaSignDate')).not.toBeInTheDocument();
    });
});
