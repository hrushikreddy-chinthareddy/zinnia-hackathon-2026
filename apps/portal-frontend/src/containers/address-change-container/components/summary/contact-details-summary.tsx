import { Address, AddressProps, Tag, TagVariant } from '@zinnia/bloom/components';
import { TFunction } from 'i18next';
import * as React from 'react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { formatPhone } from '@deps/helpers/string.helper';
import { Address as PolicyAddress, Policy } from '@deps/models/policy/sor-policy';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import { useAddressChange } from '../../address-change-provider';
import { AllowedRoleTypes } from '../roles-contract/utils/roles-contract-constants';
import { groupPartiesByAddress } from '../roles-contract/utils/roles-contract-helper';
import { PartyAddressCard } from '../roles-contract/utils/roles-contract-types';

type ContactDetailsSummaryProps = {
    policy: Policy;
};

const changeTable = (values: { updated: ReactNode; original: ReactNode; label: string }[], t: TFunction) => {
    return (
        <div className="mb-10 flex flex-col gap-4">
            <Typography variant={TypographyVariant.H2}>{t('contactTable.contactDetails')}</Typography>
            <table className="w-full table-fixed border-separate border-spacing-0 rounded-lg border border-gray-200">
                <thead>
                    <tr>
                        <th className="w-1/6 rounded-tl-lg border-b border-gray-200 px-4 py-2.5 text-left">{}</th>
                        <th className="w-1/2 border-b border-gray-200 px-4 py-2.5 text-left">
                            <Typography variant={TypographyVariant.BodySmBold}>{t('contactTable.existing')}</Typography>
                        </th>
                        <th className="w-1/2 rounded-tl-lg border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-left">
                            <Typography variant={TypographyVariant.BodySmBold}>{t('contactTable.new')}</Typography>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {values.map(({ updated, original, label }, index) => (
                        <tr key={label}>
                            <td className="w-1/2 border-b border-gray-200 px-4 py-2 align-middle">
                                <Typography variant={TypographyVariant.Label}>{label}</Typography>
                            </td>
                            <td className="w-1/2 border-b border-gray-200 px-4 py-2 align-middle">
                                <Typography className="text-wrap !block w-full break-words" variant={TypographyVariant.BodySm}>
                                    {original}
                                </Typography>
                            </td>
                            <td
                                className={`w-1/2 border-b border-gray-200 px-4 py-2 align-middle ${
                                    index + 1 === values.length ? 'rounded-bl-lg' : ''
                                } bg-gray-50`}
                            >
                                <Typography className="text-wrap flex break-words" variant={TypographyVariant.BodySm}>
                                    <span>{updated}</span>
                                    <span className="flex flex-col justify-center align-middle">
                                        <Tag text="New" className="mx-2 h-6" variant={TagVariant.Information} />
                                    </span>
                                </Typography>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const ContactDetailsSummary = ({ policy }: ContactDetailsSummaryProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'addressChange.summary' });
    const { formData, phone, roleIdentifier } = useAddressChange();
    const addresses = [{ ...formData.addresses['entered'] }, { ...formData.addresses['validated'] }];
    const newAddress = addresses.find(a => a.addressId === formData.selectedId);

    const extractedParties = React.useMemo(() => policy?.parties || [], [policy]);
    const extractedPartyRoles = React.useMemo(
        () => policy?.partyRoles?.filter(role => AllowedRoleTypes.includes(role?.partyRole ?? '')) || [],
        [policy]
    );

    const partyCardsData: PartyAddressCard[] = React.useMemo(
        () => groupPartiesByAddress(extractedPartyRoles, extractedParties, t),
        [extractedPartyRoles, extractedParties, t]
    );

    const oldContactDetails = partyCardsData.filter(p => {
        return p.partyRoles.includes(roleIdentifier.partyRole as string);
    });

    const makeAddress = (address: PolicyAddress | undefined) => {
        if (!address) {
            return DEFAULT_ERROR_STRING;
        }
        return Address({
            ...(address as AddressProps),
            addrLine1: address?.addressLine1,
            addrLine2: address?.addressLine2,
            addrLine3: address?.addressLine3,
        });
    };

    const tableArgs = [];
    if (formData.isAddressChangeRequire && newAddress) {
        tableArgs.push({
            updated: makeAddress(newAddress),
            original: makeAddress(oldContactDetails[0].address),
            label: t('contactTable.address'),
        });
    }
    if (formData.isPhoneChangeRequire && phone) {
        tableArgs.push({
            updated: phone ? formatPhone(phone) : '',
            original: oldContactDetails[0].homePhone ? formatPhone(oldContactDetails[0].homePhone) : '',
            label: t('contactTable.phone'),
        });
    }

    return tableArgs.length > 0 ? changeTable(tableArgs, t) : null;
};
