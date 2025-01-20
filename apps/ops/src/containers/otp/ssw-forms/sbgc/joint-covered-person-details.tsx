import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import { FieldSize } from '@deps/components/fields/field';
import AddressEntry from '@deps/components/otp-withdrawal-form/address-entry';
import { SingleParty } from '@deps/components/otp-withdrawal-form/form-party/party-helper';
import SelectSimple from '@deps/components/select/select';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { Address, PartyRoles, PayoutOptions } from '@deps/models/case/withdrawal/case';

import {
    DEFAULT_JOINT_PERSON_DATA,
    payoutOptions,
    relationshipToCoveredPerson,
    RelationshipToCoveredPerson,
} from './joint-covered-person.helper';
import useSbgcConfig from './sbgc-ssw-form-helper';

type JointCoveredPersonDetailsProps = {
    isReadOnly: boolean;
    planCode?: string;
};

const JointCoveredPersonDetails = ({ isReadOnly, planCode }: JointCoveredPersonDetailsProps) => {
    const { formParty, setFormParty } = useContext(FormDataContext);
    const party = formParty?.parties?.find(item => item.partyRoleType === PartyRoles.JOINTCOVEREDPERSON);
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });

    const [relationToCoveredPerson, setRelationToCoveredPerson] = useState(
        party?.relationshipToOwnerAnnutant || RelationshipToCoveredPerson.NA
    );

    const [payoutOption, setPayoutOption] = useState(PayoutOptions.level);

    const { coveredPartyConfigs } = useSbgcConfig(t);

    const [partyInfo, setPartyInfo] = useState(party || DEFAULT_JOINT_PERSON_DATA);

    useEffect(() => {
        const updatedParty = formParty?.parties?.map(item => {
            if (item.partyRoleType === PartyRoles.JOINTCOVEREDPERSON) {
                return partyInfo;
            }
            return item;
        });
        if (!party) {
            updatedParty.push(partyInfo);
        }
        setFormParty(formParty => ({
            ...formParty,
            parties: updatedParty,
        }));
    }, [partyInfo]);

    const handleAddressUpdate = (addr: Address) => {
        setPartyInfo(party => ({ ...party, addresses: [addr] as Address | any }));
    };

    return (
        <>
            <div className="my-3">
                <label className="font-primary text-md font-bold">{t('sswProgram.relationshipToCoveredPerson.title')}</label>
            </div>
            <SingleParty
                fields={coveredPartyConfigs[0].fields}
                isFormStateReadOnly={isReadOnly}
                formParty={partyInfo}
                formErrors={{}}
                onDataChange={val => setPartyInfo(val)}
            />
            <div className="my-6 mt-3 border-b-2 border-gray-100"></div>
            <div className="my-4 grid grid-cols-3 gap-2">
                <SelectSimple
                    disabled={isReadOnly}
                    className="max-w-lg"
                    label={t('sswProgram.relationshipToCoveredPerson.label') as string}
                    options={relationshipToCoveredPerson(t)}
                    onChange={val => {
                        setRelationToCoveredPerson(val as RelationshipToCoveredPerson);
                        setPartyInfo(party => ({ ...party, relationshipToOwnerAnnutant: val as RelationshipToCoveredPerson }));
                    }}
                    size={FieldSize.Small}
                    value={relationToCoveredPerson}
                    name="relationToCoveredPerson"
                />
                {/* TODO- Get proper requirement of Plan Code and update */}
                {(planCode === '772' || planCode === '728' || planCode === '775') && (
                    <SelectSimple
                        disabled={isReadOnly}
                        className="max-w-lg"
                        label={t('sswProgram.payout.title') as string}
                        options={payoutOptions(t)}
                        onChange={val => {
                            setPayoutOption(val as PayoutOptions);
                            setPartyInfo(party => ({ ...party, withdrawalPayoutOption: val as PayoutOptions }));
                        }}
                        size={FieldSize.Small}
                        value={payoutOption}
                        name="payoutOptions"
                    />
                )}
            </div>
            <div className="my-6 mt-3 border-b-2 border-gray-100"></div>

            <div className="grid w-full gap-4">
                <AddressEntry
                    initialAddress={partyInfo.addresses[0]}
                    errors={{}}
                    onDataChange={val => handleAddressUpdate(val)}
                    isFormStateReadOnly={isReadOnly}
                />
            </div>
        </>
    );
};

export default JointCoveredPersonDetails;
