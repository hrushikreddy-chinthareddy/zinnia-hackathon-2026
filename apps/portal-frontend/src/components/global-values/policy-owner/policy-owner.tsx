import { useTranslation } from 'next-i18next';

import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { TranslationFiles } from '@deps/config/translations';
import { toTitleCase } from '@deps/helpers/string.helper';
import { Party } from '@deps/models/policy/sor-policy';
import { sanitizeIdentifications } from '@deps/utils/sanitizers';

export interface PolicyOwnerProps {
    owner?: Party;
    planCode?: string;
    policyNumber?: string;
    displaySSN?: boolean
}

export const PolicyOwner = ({ owner, planCode, policyNumber, displaySSN }: PolicyOwnerProps) => {
    const { t } = useTranslation(TranslationFiles.COLDEFS, { useSuspense: false });

    if (!owner) return null;

    const { firstName, lastName, partyId, identifications } = owner;
    const sanitizedIdentifications = sanitizeIdentifications(identifications);
    const ssn = displaySSN ? (sanitizedIdentifications?.[0]?.identificationValue ?? '-') : '';

    return (
        <div className="mt-4 flex shrink-0 items-center sm:ml-14 md:ml-0 md:mt-0">
            <div className="flex flex-col">
                <label className="font-primary text-[12px] font-bold text-gray-900">{t('policyDetails.groups.owner')}</label>
                <NavElement
                    size={NavElementSize.Small}
                    type={NavElementType.Link}
                    className="mt-[3px]"
                    href={`/policies/${planCode}/${policyNumber}/people/${partyId}`}
                >
                    <PiiWrapper>{toTitleCase(`${firstName} ${lastName}`)} {ssn ? `(${ssn})` : ''}</PiiWrapper>
                </NavElement>
            </div>
        </div>
    );
};
