import * as React from 'react';
import { useTranslation } from 'react-i18next';

import Radio, { RadioVariant } from '@deps/components/radio/radio';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useAddressChange } from '@deps/containers/address-change-container/address-change-provider';
import { PolicyParties } from '@deps/models/policy/sor-policy';

import { getRolesRadioConfig } from '../utils/roles-contract-helper';

interface RolesRadioSelectorsProps {
    extractedPartyRoles: PolicyParties[];
}

export const RolesRadioSelectors = ({ extractedPartyRoles }: RolesRadioSelectorsProps) => {
    const { roleIdentifier, setRoleIdentifier } = useAddressChange();
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'addressChange' });

    const onChangeHandler = React.useCallback(
        (extractedPartyRoles: PolicyParties[]) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedOption = extractedPartyRoles?.find(item => item?.partyRoleId?.toString() === e.target.value);
            if (selectedOption) {
                setRoleIdentifier({
                    partyRoleId: selectedOption?.partyRoleId,
                    partyRole: selectedOption?.partyRole,
                    partyId: selectedOption?.partyId,
                });
            }
        },
        [setRoleIdentifier]
    );

    const radioOptions = getRolesRadioConfig(extractedPartyRoles, t);
    React.useEffect(() => {
        if (extractedPartyRoles && extractedPartyRoles[0]) {
            const defaultSelected = extractedPartyRoles[0];
            if (defaultSelected) {
                setRoleIdentifier({
                    partyRoleId: defaultSelected?.partyRoleId,
                    partyRole: defaultSelected?.partyRole,
                    partyId: defaultSelected?.partyId,
                });
            }
        }
    }, [setRoleIdentifier, extractedPartyRoles]);

    return (
        <>
            <Typography variant={TypographyVariant.LabelLg}>{t('rolesAndContracts.roleSelectTitle')}</Typography>
            <Radio
                items={radioOptions}
                onChange={onChangeHandler(extractedPartyRoles)}
                value={roleIdentifier.partyRoleId?.toString()}
                required={false}
                disabled={false}
                name={'policyRolesRadioOptions.selectOptions'}
                variant={RadioVariant.Default}
            />
        </>
    );
};
