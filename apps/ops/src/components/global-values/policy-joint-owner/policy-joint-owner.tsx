import { useTranslation } from 'next-i18next';

import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { TranslationFiles } from '@deps/config/translations';
import { toTitleCase } from '@deps/helpers/string.helpers';
import { Party } from '@deps/models/policy/sor-policy';
import { sanitizeIdentifications } from '@deps/utils/sanitizers';

export interface PolicyJointOwnerProps {
    jointOwner?: Party;
    planCode?: string;
    policyNumber?: string;
    showLink?: boolean;
}

export const PolicyJointOwner = ({ jointOwner, planCode, policyNumber, showLink }: PolicyJointOwnerProps) => {
    const { t } = useTranslation(TranslationFiles.COLDEFS, { useSuspense: false });

    if (!jointOwner) return null;

    const { firstName, lastName, partyId, identifications } = jointOwner;
    const sanitizedIdentifications = sanitizeIdentifications(identifications);
    const jointOwnerName = toTitleCase([firstName, lastName].filter(Boolean).join(' '));

    return (
        <div className="mt-4 flex shrink-0 items-center sm:ml-14 md:ml-0 md:mt-0">
            <div className="flex flex-col">
                <label className="field-label">{t('policyDetails.groups.jointOwner')}</label>
                {showLink ? (
                    <NavElement
                        size={NavElementSize.Small}
                        type={NavElementType.Link}
                        className="mt-[3px]"
                        href={`/policies/${planCode}/${policyNumber}/people/${partyId}`}
                    >
                        <PiiWrapper>
                            {jointOwnerName} ({sanitizedIdentifications?.[0]?.identificationValue})
                        </PiiWrapper>
                    </NavElement>
                ) : (
                    <PiiWrapper>
                        {jointOwnerName} ({sanitizedIdentifications?.[0]?.identificationValue})
                    </PiiWrapper>
                )}
            </div>
        </div>
    );
};
