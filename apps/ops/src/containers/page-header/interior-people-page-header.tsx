import {
    PartyRole,
    PartyStatus,
    PartyType,
    Party,
    PolicyPartyRoles,
} from '@zinnia/api-types/types/sor';
import { TFunction, useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { PageHeader } from '@deps/components/page-header/page-header';
import PartyTag from '@deps/components/party/party-tag';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { calculateAgeNumber } from '@deps/helpers/age.helpers';
import {
    getHeaderText,
    getPrefCommunicationType,
} from '@deps/helpers/party-info-helpers';
import { orderObjectsByString } from '@deps/helpers/sort.helpers';
import { formatDate } from '@deps/helpers/string.helpers';
import { ReactComponent as EditIcon } from '@deps/styles/elements/icons/icons_outlined/edit-alt.svg';
import { ReactComponent as UserGroup } from '@deps/styles/elements/icons/icons_outlined/user-group.svg';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import { HeaderInfoCard } from '../people-data-cards/header-info-card/header-info-card';
import { NameCard } from '../people-data-cards/name-card/name-card';
import { convertToChipText } from '../people-sub-page/people-sub-page.helpers';

interface InteriorPeoplePageHeaderContainerProps {
    selectedPolicyParty?: Party;
    selectedPolicyPartyRoles?: PolicyPartyRoles[];
    editable: boolean;
    partyStatus?: PartyStatus;
    isUserPermissionedToEditCards?: boolean;
}

const InteriorPeoplePageHeaderContainer = ({
    selectedPolicyParty,
    selectedPolicyPartyRoles,
    editable,
    isUserPermissionedToEditCards,
    partyStatus,
}: InteriorPeoplePageHeaderContainerProps) => {
    const { t } = useTranslation();
    const { featureFlags } = useOptimizely();
    const shouldShowEditCommunicationsPreferences =
        featureFlags[FEATURE_FLAGS.COMMUNICATION_PREFERENCES];
    const selectedPartyRoles = selectedPolicyPartyRoles?.map((roleObject) => {
        return roleObject.partyRole?.toLowerCase();
    });
    const isAgent =
        selectedPartyRoles?.includes(
            PartyRole.PRIMARYWRITINGAGENT.toLowerCase()
        ) ||
        selectedPartyRoles?.includes(
            PartyRole.PRIMARYSERVICINGAGENT.toLowerCase()
        );

    // for header text siblings group one
    // pronouns and edit button
    const getPronouns = (partyType: string | undefined) => {
        const pronouns = (selectedPolicyParty as any)?.pronouns;
        if (!partyType || partyType !== PartyType.INDIVIDUAL || !pronouns) {
            return null;
        }

        return (
            <div className="flex h-6 items-center gap-2 xs:mt-2 md:ml-4">
                <p className="font-primary text-sm font-bold">{pronouns}</p>
                <NavElement
                    type={NavElementType.Button}
                    size={NavElementSize.Small}
                    tabIndex={0}
                    className=" h-4"
                >
                    <EditIcon height={16} />
                </NavElement>
            </div>
        );
    };

    // for header text siblings group two
    // date of birth
    const getDateOfBirth = (
        partyType: string | undefined,
        editable: boolean
    ): JSX.Element | null => {
        if (!partyType || partyType !== PartyType.INDIVIDUAL || isAgent) {
            return null;
        } else {
            const ageInYears = calculateAgeNumber(
                selectedPolicyParty?.dateOfBirth
            );
            return (
                <div>
                    <span className="flex items-center gap-2 align-middle">
                        <p
                            className="typography-labels-field-label"
                            id="people-birth-date"
                        >
                            {t('people.party.birthDate')}
                        </p>
                    </span>

                    <p className="typography-content-body-sm">
                        <PiiWrapper>
                            {formatDate(selectedPolicyParty?.dateOfBirth)}
                        </PiiWrapper>
                    </p>
                    {ageInYears !== undefined && (
                        <p className="typography-content-body-sm">
                            <PiiWrapper>
                                {t('policy.detailCards.coveredParty.yearsOld', {
                                    count: ageInYears,
                                })}
                            </PiiWrapper>
                        </p>
                    )}
                </div>
            );
        }
    };

    // for below header text children
    // header party roles and add/remove button
    const getPartyRoles = (
        partyRoleTextsToConvert: PolicyPartyRoles[],
        t: TFunction
    ) => {
        const orderedTags: string[] = t('colDefs:people.orderedRoles', {
            returnObjects: true,
        });
        const convertedPartyRoles = (partyRoleTextsToConvert || []).map(
            (partyRoleTextToConvert) => ({
                text: convertToChipText(partyRoleTextToConvert.partyRole, t),
            })
        );
        return orderObjectsByString(convertedPartyRoles, orderedTags, 'text');
    };

    const tags = useMemo(
        () =>
            selectedPolicyPartyRoles &&
            getPartyRoles(selectedPolicyPartyRoles, t),
        [selectedPolicyPartyRoles, t]
    );

    const partyRoleTags = (
        <div className="mt-1 flex xs:flex-col md:flex-row md:items-center md:align-middle">
            <div className="flex flex-wrap gap-1">
                {tags?.map((tag: { text: string }) => (
                    <span key={tag.text} className="pointer-events-none">
                        <PartyTag partyStatus={partyStatus} text={tag.text} />
                    </span>
                ))}
            </div>
        </div>
    );

    // props
    const headerText = (
        <NameCard
            t={t}
            selectedPolicyParty={selectedPolicyParty}
            editable={editable}
            isUserPermissionedToEditCards={isUserPermissionedToEditCards}
        >
            {getHeaderText(selectedPolicyParty)}
        </NameCard>
    );
    const headerTextSiblingsGroupOne = getPronouns(
        selectedPolicyParty?.partyType
    );
    const headerTextSiblingsGroupTwo =
        shouldShowEditCommunicationsPreferences ? (
            <HeaderInfoCard
                t={t}
                selectedPolicyParty={selectedPolicyParty}
                editable={editable}
                isUserPermissionedToEditCards={isUserPermissionedToEditCards}
            >
                {getDateOfBirth(selectedPolicyParty?.partyType, editable)}
            </HeaderInfoCard>
        ) : (
            <div className="flex items-start align-baseline">
                {getPrefCommunicationType(selectedPolicyParty ?? null, t)}
                {getDateOfBirth(selectedPolicyParty?.partyType, editable)}
            </div>
        );
    const belowHeaderTextChildren = partyRoleTags;
    const headerRowFlexClassNames = 'xs:flex-col lg:flex-row xs:gap-4 lg:gap-0';
    const groupOneFlexClassNames = 'flex xs:flex-col lg:flex-row';

    return (
        <PageHeader
            headerText={headerText}
            headerTextSiblingsGroupOne={headerTextSiblingsGroupOne}
            headerTextSiblingsGroupTwo={headerTextSiblingsGroupTwo}
            subHeaderTextChildren={belowHeaderTextChildren}
            headerRowFlexClassNames={headerRowFlexClassNames}
            groupOneFlexClassNames={groupOneFlexClassNames}
        />
    );
};

export default InteriorPeoplePageHeaderContainer;
