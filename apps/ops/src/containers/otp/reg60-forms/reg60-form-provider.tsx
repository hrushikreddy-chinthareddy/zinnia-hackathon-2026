import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Reg60FormContext } from '@deps/contexts/Reg60FormContext';
import { Actions } from '@deps/models/case/case';
import { TaskStatus } from '@deps/models/case/task-instance';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

import { CurrentPage, Reg60FormProvider } from './reg60.types';
import { getCreateDisclosureInfo, createAgentInfo, createDisclosureAuthorization, createOwnerInfo } from './utils/reg60-form-helpers';

export const FormProvider = ({ children, form }: Reg60FormProvider) => {
    const searchParams = useSearchParams();
    const newDisclosure = {
        proposedAnnuitizationQuote: {
            annuityPaymentAmount: 0,
            firstPaymentDate: '',
            paymentFrequency: '',
            incomeOption: '',
            periodCertainYears: '',
        },
        contractComparison: getCreateDisclosureInfo(),
    };
    const [disclosureAuthorization, setDisclosureAuthorization] = useState(
        form?.data?.disclosureAuthorization || createDisclosureAuthorization
    );
    const [ownerInformation, setOwnerInformation] = useState(form?.data?.ownerInformation || createOwnerInfo);
    const [agentInformation, setAgentInformation] = useState(form?.data?.agentInformation || createAgentInfo);
    const [formErrors, setFormErrors] = useState<FormValidationErrors>({});
    const [currentPage, setCurrentPage] = useState(CurrentPage.INFO);
    const [disclosure, setDisclosure] = useState(form?.data.disclosure || newDisclosure);

    const isFormStateReadOnly = searchParams.get('action') === Actions.ReadOnly && form.status === TaskStatus.Completed;

    return (
        <Reg60FormContext.Provider
            value={{
                isFormStateReadOnly,
                formErrors,
                ownerInformation,
                disclosureAuthorization,
                initialForm: form,
                currentPage,
                agentInformation,
                disclosure,
                setDisclosure,
                setFormErrors,
                setCurrentPage,
                setOwnerInformation,
                setAgentInformation,
                setDisclosureAuthorization,
            }}
        >
            {children}
        </Reg60FormContext.Provider>
    );
};
