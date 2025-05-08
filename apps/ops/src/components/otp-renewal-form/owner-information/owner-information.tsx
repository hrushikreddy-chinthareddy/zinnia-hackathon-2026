import { useTranslation } from 'next-i18next';
import { useContext, useState, useEffect } from 'react';

import FieldLabel from '@deps/components/fields/field-label';
import { OwnerConfig } from '@deps/containers/otp/renewal-forms/mass-mutual-form.helpers';
import { RenewalFormDataContext } from '@deps/contexts/OtpRenewalFormContext';
import { OwnerInformation, Signature } from '@deps/models/case/task';

import { AdditionalOwnerInformation, SingleOwner } from './owner-information-helpers';

interface FormPartiesProps {
    configs: OwnerConfig[];
    isFormStateReadOnly: boolean;
}

const getInitialOwner = (parties: OwnerInformation[]): AdditionalOwnerInformation[] => {
    const owners = parties?.map((party, index) => {
        return { ...party, id: index };
    });

    return owners;
};
export const DEFAULT_OWNER = [
    {
        type: 'Primary',
        firstName: '',
        middleName: '',
        lastName: '',
        fullName: '',
        signature: {} as Signature,
        id: 0,
    },
];

export default function OwnerInfo({ configs, isFormStateReadOnly }: FormPartiesProps) {
    const { ownerInformation, setOwnerInformation } = useContext(RenewalFormDataContext);
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const parties = ownerInformation.length ? ownerInformation : DEFAULT_OWNER;
    const [partyInfo, setPartyInfo] = useState<AdditionalOwnerInformation[]>(getInitialOwner(parties));

    const setPartyInformation = (val: OwnerInformation, i: number) => {
        setPartyInfo(parties => {
            return parties?.map((party, j) => {
                if (i !== j) {
                    return party;
                }

                return val;
            });
        });
    };

    useEffect(() => {
        const parties = partyInfo.map(party => {
            const mappedparty = { ...party };
            delete mappedparty.id;
            return mappedparty;
        });
        setOwnerInformation(parties);
    }, [partyInfo]);

    return (
        <>
            {configs?.map((config, index) => {
                const party = partyInfo.find(party => party.type === config.partyRoleType);

                if (party) {
                    return (
                        <div key={index} className="mb-4">
                            <FieldLabel labelClassNames="!mb-[5px] text-md" label={config.title || (t(`title`) as string)} />
                            <div>
                                <SingleOwner
                                    fields={config.fields}
                                    formParty={party}
                                    formErrors={{}}
                                    onDataChange={val => setPartyInformation(val, index)}
                                    isFormStateReadOnly={isFormStateReadOnly}
                                />
                            </div>
                        </div>
                    );
                }
            })}
        </>
    );
}
