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

    const [payoutOption, setPayoutOption] = useState(party?.withdrawalPayoutOption || '' as PayoutOptions);
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

    const handlePayoutUpdate = (val: PayoutOptions) => {
        setPayoutOption(val);
        setPartyInfo(party => ({ ...party, withdrawalPayoutOption: val }));
    };

    const handleRelationshipUpdate = (val: RelationshipToCoveredPerson) => {
        setRelationToCoveredPerson(val);
        setPartyInfo(party => ({ ...party, relationshipToOwnerAnnutant: val }));
    }

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
                    onChange={val => handleRelationshipUpdate(val as RelationshipToCoveredPerson)}
                    size={FieldSize.Small}
                    value={relationToCoveredPerson}
                    name="relationToCoveredPerson"
                />
                {planCode === '772' && (
                    <SelectSimple
                        disabled={isReadOnly}
                        className="max-w-lg"
                        label={t('sswProgram.payout.title') as string}
                        options={payoutOptions(t)}
                        onChange={val => handlePayoutUpdate(val as PayoutOptions)}
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
