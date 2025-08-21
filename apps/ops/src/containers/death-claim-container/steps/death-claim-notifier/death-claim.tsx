import { PartyRole, PhoneType, Policy } from '@zinnia/api-types/types/sor';
import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import { countries } from 'countries-list';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Content, { ContentVariant } from '@deps/components/content/content';
import { FieldSize, FieldVariant } from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import {
    DEFAULT_NOTIFIER_PARTY,
    DEFAULT_PHONE,
} from '@deps/containers/death-claim-container/death-claim.helpers';
import {
    getNotifiersByRoles,
    validatePhoneNumber,
} from '@deps/containers/death-claim-container/steps/death-claim-notifier/death-claim-notifier.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

import { AddBeneficiaryCard } from './add-beneficiary-card';
import getDeathClaimConfig from './death-claim.config';
import styles from './death-claim.module.css';
import OtherNotifier from './other-notifier';
import { PartyCard } from './party-card';
import PhoneNumber from './phone-number';
import {
    ClaimActionTypes,
    NotifierParty,
    RoleType,
} from '../../death-claim.types';

interface DeathClaimProps {
    policy: Policy;
    notifiers: NotifierParty;
    formErrors: FormValidationErrors;
    isNewBene: boolean;
    handleNewBene: (value: boolean) => void;
    updateNotifier: (notifier: NotifierParty) => void;
    setFormErrors: React.Dispatch<React.SetStateAction<FormValidationErrors>>;
    isIndividual: boolean;
    isNonIndividual: boolean;
}

export const INITIAL_PHONE = {
    countryCode: '1',
    phoneType: PhoneType.HOME,
    dialNumber: '',
    areaCode: '',
};

export const DeathClaim = ({
    policy,
    formErrors,
    notifiers,
    isNewBene,
    handleNewBene,
    updateNotifier,
    setFormErrors,
    isIndividual,
    isNonIndividual,
}: DeathClaimProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'deathClaims.deathClaimNotification',
    });
    const { otherRoleFields, newBeneFields } = getDeathClaimConfig(t);

    const primaryBenificaries = useMemo(() => {
        return getNotifiersByRoles(policy, [PartyRole.PRIMARYBENEFICIARY]);
    }, [policy]);

    const allAgents = useMemo(() => {
        const agentRoles = [
            PartyRole.AGENT,
            PartyRole.PRIMARYSERVICINGAGENT,
            PartyRole.PRIMARYWRITINGAGENT,
            PartyRole.ADDITIONALSERVICINGAGENT,
            PartyRole.ADDITIONALWRITINGGAGENT,
            'ADDITIONALWRITINGAGENT' as PartyRole, // BPB - typo
        ];
        return getNotifiersByRoles(policy, agentRoles);
    }, [policy]);

    const allBeneficiaries = useMemo(() => {
        return getNotifiersByRoles(policy, [
            PartyRole.PRIMARYBENEFICIARY,
            PartyRole.CONTINGENTBENEFICIARY,
        ]);
    }, [policy]);

    const allOwners = useMemo(() => {
        return getNotifiersByRoles(policy, [
            PartyRole.OWNER,
            PartyRole.JOINTOWNER,
        ]);
    }, [policy]);

    const allAnnuitants = useMemo(() => {
        return getNotifiersByRoles(policy, [PartyRole.ANNUITANT]);
    }, [policy]);

    const isSingleOwner = useMemo(() => {
        return (
            allOwners?.length === 1 &&
            allOwners[0]?.party.partyRole === PartyRole.OWNER
        );
    }, [allOwners]);

    const isSingleAnnuitant = useMemo(() => {
        return (
            allAnnuitants?.length === 1 &&
            allAnnuitants[0]?.party.partyRole === PartyRole.ANNUITANT
        );
    }, [allAnnuitants]);

    const roleType = useMemo(() => {
        return [
            {
                label: t('labels.roleType.agent'),
                value: RoleType.Agent,
                disabled: allAgents?.length === 0,
            },
            {
                label: t('labels.roleType.beneficiary'),
                value: RoleType.Beneficiary,
                disabled: allBeneficiaries?.length === 0,
            },
            {
                label: t('labels.roleType.owner'),
                value: RoleType.Owner,
                disabled:
                    allOwners?.length === 0 || isSingleOwner || isNonIndividual,
            },
            {
                label: t('labels.roleType.annuitant'),
                value: RoleType.Annuitant,
                disabled:
                    allAnnuitants?.length === 0 ||
                    isSingleAnnuitant ||
                    isIndividual,
            },
            { label: t('labels.roleType.other'), value: RoleType.Other },
        ];
    }, [
        t,
        allAgents?.length,
        allBeneficiaries?.length,
        allOwners?.length,
        isSingleOwner,
        isNonIndividual,
        allAnnuitants?.length,
        isIndividual,
        isSingleAnnuitant,
    ]);

    const defaultRole = useMemo(() => {
        let role = RoleType.Other;
        if (allBeneficiaries?.length > 0) {
            role = RoleType.Beneficiary;
        } else if (allAgents?.length > 0) {
            role = RoleType.Agent;
        } else if (
            (allOwners?.length === 0 || isSingleOwner || isNonIndividual) ===
            false
        ) {
            role = RoleType.Owner;
        } else if (
            (allAnnuitants?.length === 0 ||
                isSingleAnnuitant ||
                isIndividual) === false
        ) {
            role = RoleType.Annuitant;
        }
        return role;
    }, [
        allAgents?.length,
        allBeneficiaries?.length,
        allOwners?.length,
        isSingleOwner,
        isNonIndividual,
        allAnnuitants?.length,
        isIndividual,
        isSingleAnnuitant,
    ]);

    const [role, setRole] = useState<RoleType>(
        (notifiers?.notifierRole as RoleType) || defaultRole
    );
    const [phone, setPhone] = useState<any>(
        notifiers?.party?.phone || INITIAL_PHONE
    );
    const [country, setCountry] = useState('US' as keyof typeof countries);
    const [selectedParty, setSelectedParty] = useState<NotifierParty>(
        notifiers || DEFAULT_NOTIFIER_PARTY
    );
    const [isPrimaryBeneInfoOnFile, setIsPrimaryBeneInfoOnFile] =
        useState<boolean>(notifiers?.isPrimaryBeneInfoOnFile || false);

    useEffect(() => {
        if (!role) {
            return;
        }

        if (role !== RoleType.Beneficiary) {
            handleNewBene(false);
        }

        setSelectedParty((prevState) => {
            return {
                ...prevState,
                party: {
                    ...prevState.party,
                    //...DEFAULT_PARTY,
                    phone: {
                        //...DEFAULT_PHONE,
                        ...prevState.party.phone,
                    },
                },
                notifierRole: role,
            };
        });
    }, [role]);

    useEffect(() => {
        setSelectedParty((prevState) => {
            return {
                ...prevState,
                isPrimaryBeneInfoOnFile: isPrimaryBeneInfoOnFile,
            };
        });
    }, [isPrimaryBeneInfoOnFile]);

    useEffect(() => {
        const errors = validatePhoneNumber(phone, t);

        if (Object.keys(errors).length > 0) {
            setFormErrors((prevState) => ({
                ...prevState,
                ...errors,
            }));
        } else {
            setFormErrors((prevState) => {
                delete prevState?.phoneNumber;
                return prevState;
            });
        }

        setSelectedParty((prevState) => {
            const isOther = isNullEmptyOrUndefined(prevState.party.partyId);
            const { areaCode, dialNumber } = phone || {};
            const phoneNumber = `${areaCode}${dialNumber}`;
            const action =
                isOther && !isNullEmptyOrUndefined(phoneNumber)
                    ? ClaimActionTypes.ADD
                    : ClaimActionTypes.NONE;
            return {
                ...prevState,
                party: {
                    ...prevState.party,
                    phone: {
                        ...DEFAULT_PHONE,
                        ...phone,
                        action,
                    },
                },
            };
        });
    }, [phone, t]);

    useEffect(() => {
        const partyId = selectedParty?.party?.partyId;
        const { areaCode, dialNumber } = selectedParty?.party?.phone || {};
        const phoneNumber = `${areaCode}${dialNumber}`;
        let existingPhone;
        if (selectedParty.notifierRole === RoleType.Beneficiary) {
            existingPhone = allBeneficiaries?.find(
                (item) => item?.party?.partyId === partyId
            )?.party?.phone;
        } else if (selectedParty.notifierRole === RoleType.Owner) {
            existingPhone = allOwners?.find(
                (item) => item?.party?.partyId === partyId
            )?.party?.phone;
        } else if (selectedParty.notifierRole === RoleType.Agent) {
            existingPhone = allAgents?.find(
                (item) => item?.party?.partyId === partyId
            )?.party?.phone;
        } else if (selectedParty.notifierRole === RoleType.Annuitant) {
            existingPhone = allAnnuitants?.find(
                (item) => item?.party?.partyId === partyId
            )?.party?.phone;
        }
        const existingPhoneNumber = existingPhone
            ? `${existingPhone?.areaCode}${existingPhone?.dialNumber}`
            : '';
        if (
            !isNullEmptyOrUndefined(phoneNumber) &&
            existingPhoneNumber !== phoneNumber
        ) {
            selectedParty.party.phone.action = ClaimActionTypes.ADD;
        }

        updateNotifier(selectedParty);
    }, [
        allBeneficiaries,
        allOwners,
        allAgents,
        allAnnuitants,
        selectedParty,
        isNewBene,
        t,
    ]);

    const onCardClick = (values: any) => {
        const { areaCode, dialNumber } = phone || {};
        const phoneNumber = `${areaCode}${dialNumber}`;
        const existingPhone = values.party?.phone;
        const existingPhoneNumber = existingPhone
            ? `${existingPhone?.areaCode}${existingPhone?.dialNumber}`
            : '';

        if (
            !isNullEmptyOrUndefined(phoneNumber) &&
            existingPhoneNumber !== phoneNumber
        ) {
            values.party.phone = {
                ...phone,
                action: ClaimActionTypes.ADD,
            };
        }
        handleNewBene(false);
        setSelectedParty((prevState) => {
            return {
                ...prevState,
                party: {
                    ...prevState.party,
                    ...values.party,
                },
            };
        });
    };

    const onNewBeneCardClick = (value: boolean) => {
        handleNewBene(value);
    };

    const getBeneficiariesCard = () => {
        return (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 my-4">
                <PartyCard
                    parties={allBeneficiaries}
                    selectedItem={selectedParty}
                    onCardClick={onCardClick}
                    isNewBene={isNewBene}
                />
                <AddBeneficiaryCard
                    onCardClick={onNewBeneCardClick}
                    isNewBene={isNewBene}
                />
            </div>
        );
    };

    const getAllOwnersCard = () => {
        return (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 my-4">
                <PartyCard
                    parties={allOwners}
                    selectedItem={selectedParty}
                    onCardClick={onCardClick}
                />
            </div>
        );
    };

    const getAllAgentsCard = () => {
        return (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 my-4">
                <PartyCard
                    parties={allAgents}
                    selectedItem={selectedParty}
                    onCardClick={onCardClick}
                />
            </div>
        );
    };

    const getAllAnnuitantsCard = () => {
        return (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 my-4">
                <PartyCard
                    parties={allAnnuitants}
                    selectedItem={selectedParty}
                    onCardClick={onCardClick}
                />
            </div>
        );
    };

    const onDataChange = (values: any) => {
        setSelectedParty((prevState) => {
            return {
                ...prevState,
                party: {
                    ...prevState.party,
                    ...values,
                },
            };
        });
    };

    const onBeneDataChange = (values: any) => {
        setSelectedParty((prevState) => {
            return {
                ...prevState,
                party: {
                    ...prevState.party,
                    ...values,
                },
            };
        });
    };

    const displayRoleBasedSections = useMemo(() => {
        switch (role) {
            case RoleType.Agent:
                return getAllAgentsCard();
            case RoleType.Owner:
                return getAllOwnersCard();
            case RoleType.Beneficiary:
                return getBeneficiariesCard();
            case RoleType.Annuitant:
                return getAllAnnuitantsCard();
            case RoleType.Other:
                return (
                    <OtherNotifier
                        fields={otherRoleFields}
                        onDataChange={onDataChange}
                        formErrors={formErrors}
                    />
                );
            default:
                return null;
        }
    }, [
        role,
        allOwners,
        allBeneficiaries,
        allAgents,
        allAnnuitants,
        isNewBene,
        formErrors,
        otherRoleFields,
    ]);

    return (
        <>
            <div className="my-2">
                <Typography variant={TypographyVariant.LabelLg}>
                    {t('labels.notifierDetails')}
                </Typography>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-1">
                <SelectSimple
                    className="max-w-[200px]"
                    label={t('labels.role') as string}
                    options={roleType}
                    placeholder={t('labels.selectARole') as string}
                    onChange={(val: string) => setRole(val as RoleType)}
                    size={FieldSize.Small}
                    value={role}
                    message={formErrors?.role}
                    variant={
                        formErrors?.role
                            ? FieldVariant.Error
                            : FieldVariant.Default
                    }
                />
                <PhoneNumber
                    country={country}
                    phone={phone}
                    setCountry={setCountry}
                    setPhone={setPhone}
                    formErrors={formErrors}
                />
            </div>
            <div>{role && displayRoleBasedSections}</div>
            <div>
                {role &&
                    [
                        RoleType.Agent,
                        RoleType.Owner,
                        RoleType.Other,
                        RoleType.Annuitant,
                    ].includes(role) && (
                        <div className={styles.beneList}>
                            <div className="bg-gray-50 p-6 rounded-md mt-5 my-4">
                                <Typography variant={TypographyVariant.LabelLg}>
                                    {t('labels.listedBenificary')}
                                </Typography>
                                {primaryBenificaries?.length > 0 && (
                                    <ul className="my-2">
                                        {primaryBenificaries?.map(
                                            ({ party }) => (
                                                <li
                                                    key={`bene-${party.partyId}`}
                                                >
                                                    <Content
                                                        contentClassName="min-w-max"
                                                        variant={
                                                            ContentVariant.BodySm
                                                        }
                                                        details={party.fullName}
                                                        pii={true}
                                                    />
                                                </li>
                                            )
                                        )}
                                    </ul>
                                )}
                                {primaryBenificaries &&
                                    primaryBenificaries.length === 0 && (
                                        <AssistiveText
                                            className="my-lg"
                                            variant={AssistiveTextVariant.Info}
                                            text={
                                                t(
                                                    'labels.noBeneficiaries'
                                                ) as string
                                            }
                                        />
                                    )}
                            </div>
                        </div>
                    )}
            </div>
            <div>
                {isNewBene && (
                    <OtherNotifier
                        fields={newBeneFields}
                        onDataChange={onBeneDataChange}
                        formErrors={formErrors}
                    />
                )}
            </div>
            {formErrors?.beneficiary && (
                <AssistiveText
                    text={formErrors?.beneficiary}
                    variant={AssistiveTextVariant.Error}
                    className="mt-2"
                />
            )}
            <div className="my-4">
                <CheckboxText
                    label={t('labels.beneInfoOnFile')}
                    checked={isPrimaryBeneInfoOnFile}
                    onChange={() => {
                        setIsPrimaryBeneInfoOnFile(!isPrimaryBeneInfoOnFile);
                    }}
                    data-testid="is-primary-bene-info-on-file-test-id"
                    className="!items-start"
                />
            </div>
        </>
    );
};
