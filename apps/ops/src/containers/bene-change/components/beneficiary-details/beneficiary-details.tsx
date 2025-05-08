import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { Email, PartyRole, Policy } from '@deps/models/policy/sor-policy';
import { ReactComponent as MailIcon } from '@deps/styles/elements/icons/communications/mail.svg';
import { ReactComponent as ChartPieIcon } from '@deps/styles/elements/icons/icons_outlined/chart-pie.svg';
import { ReactComponent as ChevronUp } from '@deps/styles/elements/icons/icons_outlined/chevron-up.svg';
import { ReactComponent as FingerprintIcon } from '@deps/styles/elements/icons/icons_outlined/fingerprint.svg';
import { ReactComponent as ContactIcon } from '@deps/styles/elements/icons/icons_outlined/phone.svg';
import { ReactComponent as LocationIcon } from '@deps/styles/elements/icons/navigation/location.svg';

import AddressDetails from './address-details/address-details';
import { EnterpriseAddress, INITIAL_ADDRESS } from './address-details/address-details.helpers';
import AllocationDetails from './allocation-details/allocation-details';
import BeneficiaryIdentification from './bene-identification/bene-identification';
import { getInitialBene } from './beneficiary-details.helpers';
import BeneficiaryInformation from './beneficiary-information/beneficiary-information';
import EmailDetails from './email-details/email-details';
import { INITIAL_EMAIL } from './email-details/email-details.helpers';
import PhoneDetails from './phone-details/phone-details';
import { EnterprisePhone, INITIAL_PHONE } from './phone-details/phone-details.helpers';
import { useBeneChange } from '../../bene-change-provider';

interface BeneficiaryDetailsProps {
    partyRole: PartyRole;
    partyId?: string;
    selectedParty?: any;
    carrierId: string;
    setBeneData: Dispatch<SetStateAction<any>>;
    index: string;
    policy: Policy;
    setShowBeneficiary?: Dispatch<SetStateAction<any>>;
    action?: string;
    isNonEditable?: boolean;
    partyRoleId?: any;
}

export default function BeneficiaryDetails({
    policy,
    partyRole,
    partyId,
    selectedParty,
    carrierId,
    setBeneData,
    index,
    setShowBeneficiary,
    action,
    isNonEditable,
    partyRoleId,
}: BeneficiaryDetailsProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'beneChange.beneDetails' });
    const { beneData } = useBeneChange();
    const containerClasses = clsx('flex flex-col', 'w-full  my-3', 'rounded border-2 border-gray-100', 'bg-gray-50');
    const sectionClasses = 'flex flex-col p-4 md:p-6 lg:p-8';
    const title = partyId
        ? ''
        : partyRole === PartyRole.PRIMARYBENEFICIARY
        ? t('beneficiaryListing.addPrimaryBeneficiary')
        : t('beneficiaryListing.addContingentBeneficiary');
    const isReadOnly = partyId ? isNonEditable : false;

    const position = beneData.map((element: any) => element.index).indexOf(index);
    const relationshipToInsured = partyRoleId && policy?.partyRoles?.find(role => role.partyRoleId === partyRoleId)?.relationshipToInsured;
    const [currentBene, setCurrentBene] = useState(
        position > -1
            ? beneData[position]
            : getInitialBene(partyRole, index, selectedParty, relationshipToInsured, partyId, !isReadOnly, action, partyRoleId)
    );
    const [currentEmails, setCurrentEmails] = useState<Email[]>(currentBene?.party?.emails || [INITIAL_EMAIL]);
    const [currentPhones, setCurrentPhones] = useState<EnterprisePhone[]>(currentBene?.party?.phones || [INITIAL_PHONE]);
    const [currentAddresses, setCurrentAddresses] = useState<EnterpriseAddress[]>(currentBene?.party?.addresses || [INITIAL_ADDRESS]);
    const [beneInfo, setBeneInfo] = useState<any>(currentBene?.beneInfo || {});
    const [allocationDetails, setAllocationDetails] = useState<any>(currentBene?.party.allocation);
    const [currentParty, setCurrentParty] = useState<any>(currentBene?.party?.info || {});

    useEffect(() => {
        setBeneData((prevState: any) => {
            const position = prevState.map((element: any) => element.index).indexOf(index);
            if (position > -1) {
                prevState[position] = currentBene;
                return [...prevState];
            } else {
                return [...prevState, { ...currentBene }];
            }
        });
    }, [currentBene, index, setBeneData]);

    useEffect(() => {
        setCurrentBene((prevState: any) => {
            const newState = prevState;
            if (action !== 'ADD') {
                newState.action = isReadOnly ? 'NONE' : 'UPDATE';
                return { ...newState };
            } else {
                return { ...prevState };
            }
        });
    }, [action, isNonEditable, isReadOnly]);

    useEffect(() => {
        setCurrentBene((prevState: any) => {
            const newState = prevState;
            newState.party.addresses = currentAddresses;
            return newState;
        });
    }, [currentAddresses]);

    useEffect(() => {
        setCurrentBene((prevState: any) => {
            const newState = prevState;
            newState.party.phones = currentPhones;
            return newState;
        });
    }, [currentPhones]);

    useEffect(() => {
        setCurrentBene((prevState: any) => {
            const newState = prevState;
            newState.party.emails = currentEmails;
            return newState;
        });
    }, [currentEmails]);

    useEffect(() => {
        setCurrentBene((prevState: any) => {
            const newState = prevState;
            newState.party.info = currentParty;
            return newState;
        });
    }, [currentParty]);

    useEffect(() => {
        setCurrentBene((prevState: any) => {
            const newState = prevState;
            newState.beneInfo = beneInfo;
            return newState;
        });
    }, [beneInfo]);

    useEffect(() => {
        setCurrentBene((prevState: any) => {
            const newState = prevState;
            newState.party.allocation = allocationDetails;
            return newState;
        });
    }, [allocationDetails]);

    return (
        <div>
            <div className=" flex w-full items-center justify-between">
                <div className="mt-2">
                    <Typography variant={TypographyVariant.H2}>{title}</Typography>
                </div>
            </div>

            <div className="my-6">
                <div className="flex">
                    <FingerprintIcon role="presentation" width={24} height={24} className="mr-2 text-primary" />
                    <Typography variant={TypographyVariant.H2}>{t('identification.title')}</Typography>
                </div>
                <BeneficiaryIdentification updateParty={currentParty} setCurrentParty={setCurrentParty} isReadOnly={isReadOnly} />
            </div>

            <div className="my-6">
                <div className="my-3 flex">
                    <LocationIcon role="presentation" className="mr-2 text-primary" height={24} width={24} />
                    <Typography variant={TypographyVariant.H2}>{t('address.title')}</Typography>
                </div>

                <div className={containerClasses} key={'address'}>
                    <div className={sectionClasses}>
                        <AddressDetails
                            setCurrentAddresses={setCurrentAddresses}
                            updateAddress={currentAddresses?.[0]}
                            index={0}
                            isReadOnly={isReadOnly}
                            partyType={currentParty?.partyType}
                        />
                    </div>
                </div>
            </div>

            <div className="my-6">
                <div className="my-3 flex">
                    <ContactIcon height={24} className="mr-2 text-primary" role="presentation" />
                    <Typography variant={TypographyVariant.H2}>{t('phone.title')}</Typography>
                </div>

                <div className={containerClasses} key={'phone'}>
                    <div className={sectionClasses}>
                        <PhoneDetails
                            setCurrentPhones={setCurrentPhones}
                            updatePhone={currentPhones?.[0]}
                            index={0}
                            isReadOnly={isReadOnly}
                        />
                    </div>
                </div>
            </div>

            <div>
                <div className="my-3 flex">
                    <MailIcon role="presentation" className="mr-2 text-primary" height={24} width={24} />
                    <Typography variant={TypographyVariant.H2}>{t('email.title')}</Typography>
                </div>

                <div className={containerClasses} key={'email'}>
                    <div className={sectionClasses}>
                        <EmailDetails
                            setCurrentEmails={setCurrentEmails}
                            updateEmail={currentEmails?.[0]}
                            index={0}
                            isReadOnly={isReadOnly}
                        />
                    </div>
                </div>
            </div>

            <div className="my-6">
                <div className="flex">
                    <ChartPieIcon height={24} className="mr-2 text-primary" role="presentation" />
                    <Typography variant={TypographyVariant.H2}>{t('allocation.title')}</Typography>
                </div>

                <div className={containerClasses}>
                    <div className={sectionClasses}>
                        <AllocationDetails
                            updateAllocation={allocationDetails}
                            setAllocationDetails={setAllocationDetails}
                            isReadOnly={isReadOnly}
                        />
                    </div>
                </div>
            </div>

            <div className="my-6">
                <Typography className="mb-3" variant={TypographyVariant.H2}>
                    {t('beneInformation.title')}
                </Typography>

                <div className={containerClasses}>
                    <div className={sectionClasses}>
                        <BeneficiaryInformation
                            carrierId={carrierId}
                            setBeneInfo={setBeneInfo}
                            updateInfo={beneInfo}
                            isReadOnly={isReadOnly}
                        />
                    </div>
                </div>
            </div>

            {partyId && (
                <div className="flex  w-full justify-center  p-10 align-middle">
                    <div className="flex">
                        <NavElement
                            onClick={() => setShowBeneficiary && setShowBeneficiary(false)}
                            size={NavElementSize.Small}
                            startIcon={<ChevronUp height={20} width={20} />}
                            type={NavElementType.Button}
                        >
                            {t('close')}
                        </NavElement>
                    </div>
                </div>
            )}
        </div>
    );
}
