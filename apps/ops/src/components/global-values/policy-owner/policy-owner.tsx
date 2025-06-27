import { Party, PartyType } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';

import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { TranslationFiles } from '@deps/config/translations';
import { safeString, toTitleCase } from '@deps/helpers/string.helpers';
import { sanitizeIdentifications } from '@deps/utils/sanitizers';

export interface PolicyOwnerProps {
    owner?: Party;
    planCode?: string;
    policyNumber?: string;
    displaySSN?: boolean;
    showLink?: boolean;
}

export const PolicyOwner = ({
    owner,
    planCode,
    policyNumber,
    displaySSN,
    showLink,
}: PolicyOwnerProps) => {
    const { t } = useTranslation(TranslationFiles.COLDEFS, {
        useSuspense: false,
    });

    if (!owner) return null;

    const {
        firstName,
        lastName,
        partyId,
        identifications,
        partyType,
        fullName,
    } = owner;
    const sanitizedIdentifications = sanitizeIdentifications(identifications);
    const ssn = displaySSN
        ? sanitizedIdentifications?.[0]?.identificationValue ?? '-'
        : '';

    // DEPU-3511
    const ownerName =
        partyType === PartyType.ORGANIZATION || partyType === PartyType.TRUST
            ? toTitleCase(safeString(fullName))
            : toTitleCase([firstName, lastName].filter(Boolean).join(' '));

    return (
        <div className="mt-4 flex shrink-0 items-center sm:ml-14 md:ml-0 md:mt-0">
            <div className="flex flex-col">
                <label className="field-label">
                    {t('policyDetails.groups.owner')}
                </label>
                {showLink ? (
                    <NavElement
                        size={NavElementSize.Small}
                        type={NavElementType.Link}
                        className="mt-[3px]"
                        href={`/policies/${planCode}/${policyNumber}/people/${partyId}`}
                    >
                        <PiiWrapper>
                            {ownerName} {ssn ? `(${ssn})` : ''}
                        </PiiWrapper>
                    </NavElement>
                ) : (
                    <PiiWrapper>
                        {ownerName} {ssn ? `(${ssn})` : ''}
                    </PiiWrapper>
                )}
            </div>
        </div>
    );
};
