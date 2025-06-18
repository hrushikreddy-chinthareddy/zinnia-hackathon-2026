import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { Reg60FormContext } from '@deps/contexts/Reg60FormContext';
import { DocumentData } from '@deps/models/case/document';

import getMassMutualReg60Config from './mass-mutual-reg60-form-helpers';
import CreateDisclosure from '../components/create-disclosure/create-disclosure';
import DisclosureAuthorizationForm from '../components/disclosure-authorization/disclosure-authorization-form';
import UserInformation from '../components/user-information/user-information';
import { CurrentPage, PartyRoles } from '../reg60.types';
import { getErrorObjectByRole } from '../utils/reg60-form-helpers';

export default function MassMutualReg60Form({ document, planCode }: { document: DocumentData; planCode: string }) {
    const {
        isFormStateReadOnly,
        formErrors,
        disclosureAuthorization,
        currentPage,
        ownerInformation,
        agentInformation,
        disclosure,
        setDisclosure,
        setOwnerInformation,
        setAgentInformation,
        setDisclosureAuthorization,
    } = useContext(Reg60FormContext);

    const { t } = useTranslation(TranslationFiles.REG60DEFS, { keyPrefix: 'caseReg60.request' });
    const { disclosureAuthorizationConfig, disclosureConfig, ownerInformationConfig, agentInformtaionConfig } = getMassMutualReg60Config(t);

    const ownerInfoErrors = getErrorObjectByRole(PartyRoles.OWNER, formErrors);
    const agentInfoErrors = getErrorObjectByRole(PartyRoles.AGENT, formErrors);

    useEffect(() => {
        if (document) {
            setOwnerInformation({
                ...ownerInformation,
                personalInformation: {
                    ...ownerInformation.personalInformation,
                    firstName: ownerInformation.personalInformation.firstName || document?.firstName,
                    lastName: ownerInformation.personalInformation.lastName || document?.lastName,
                    ssNumber: ownerInformation.personalInformation.ssNumber || document.ssNTaxId || '',
                },
            });

            setAgentInformation({
                ...agentInformation,
                companyName: agentInformation.companyName || document?.bdName,
                channel: agentInformation.channel || document?.distributionChannel,
                personalInformation: {
                    ...agentInformation.personalInformation,
                    firstName: agentInformation.personalInformation.firstName || document?.agentFirstName,
                    lastName: agentInformation.personalInformation.lastName || document?.agentLastName,
                },
            });
        }
    }, [document]);

    return (
        <>
            {currentPage === CurrentPage.INFO ? (
                <div data-testid="info-page">
                    <Typography variant={TypographyVariant.H1}>{t('pageHeader')}</Typography>
                    <UserInformation
                        userInfo={ownerInformation}
                        setUserInfo={setOwnerInformation}
                        formErrors={ownerInfoErrors.OWNER}
                        formConfig={ownerInformationConfig}
                    />
                    <UserInformation
                        userInfo={agentInformation}
                        setUserInfo={setAgentInformation}
                        formErrors={agentInfoErrors.AGENT}
                        formConfig={agentInformtaionConfig}
                    />
                    <DisclosureAuthorizationForm
                        isFormStateReadOnly={isFormStateReadOnly}
                        configs={disclosureAuthorizationConfig}
                        formDisclosureAuthorization={disclosureAuthorization}
                        setFormDisclosureAuthorization={setDisclosureAuthorization}
                        formErrors={formErrors}
                        planCode={planCode}
                    />
                </div>
            ) : (
                <div data-testid="disclosure-page">
                    <CreateDisclosure disclosure={disclosure} onDisclosureChange={setDisclosure} formConfig={disclosureConfig} />
                </div>
            )}
        </>
    );
}
