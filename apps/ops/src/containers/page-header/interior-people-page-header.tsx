import { useQuery } from '@tanstack/react-query';
import { TFunction, useTranslation } from 'next-i18next';
import { useContext, useMemo } from 'react';

import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { PageHeader } from '@deps/components/page-header/page-header';
import PartyTag from '@deps/components/party/party-tag';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { calculateAgeNumber } from '@deps/helpers/age.helpers';
import {
    getHeaderText,
    getPrefCommunicationType,
} from '@deps/helpers/party-info-helpers';
import { orderObjectsByString } from '@deps/helpers/sort.helpers';
import { formatDate } from '@deps/helpers/string.helpers';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { checkExistingNameChangeEligibilityQuery } from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';
import { ReactComponent as EditIcon } from '@deps/styles/elements/icons/icons_outlined/edit-alt.svg';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    Parties,
    PartyStatus,
    PartyType,
    PolicyPartyRoles,
} from '@zinnia/api-types/types/sor';

import styles from './interior-people-page-header.module.css';
import { HeaderInfoCard } from '../people-data-cards/header-info-card/header-info-card';
import { NameCard } from '../people-data-cards/name-card/name-card';
import { convertToChipText } from '../people-sub-page/people-sub-page.helpers';
import { isAgentRole } from '../person-sub-page/person-sub-page.helpers';

interface InteriorPeoplePageHeaderContainerProps {
    /** Optional Bloom Icon element to display before the person's name */
    icon?: JSX.Element;
    selectedPolicyParty?: Parties & {
        producerName?: string;
        producerType?: string;
    };
    selectedPolicyPartyRoles?: PolicyPartyRoles[];
    editable?: boolean;
    partyStatus?: PartyStatus;
    isUserPermissionedToEditCards?: boolean;
    /** Content rendered below the entire header row (e.g., info banners) */
    belowHeaderTextChildren?: React.ReactNode;
}

const InteriorPeoplePageHeaderContainer = ({
    icon,
    selectedPolicyParty,
    selectedPolicyPartyRoles,
    editable = false,
    isUserPermissionedToEditCards,
    partyStatus,
    belowHeaderTextChildren,
}: InteriorPeoplePageHeaderContainerProps) => {
    const { t } = useTranslation();
    const { featureFlags } = useOptimizely();
    const shouldShowEditCommunicationsPreferences =
        featureFlags[FEATURE_FLAGS.COMMUNICATION_PREFERENCES] && editable;
    // Determine if every passed-in role is an agent role (hides DOB section)
    const isAgent = selectedPolicyPartyRoles?.every(
        (r) => !!r.partyRole && isAgentRole(r.partyRole)
    );

    const { policy } = useContext(PolicyData);

    const { policyNumber, product } = policy ?? {};
    const { planCode } = product ?? {};

    const { data: existingNameChangeEligibility } = useQuery({
        queryKey: [
            'existingNameChangeEligibility',
            planCode,
            policyNumber,
            selectedPolicyParty?.partyId,
        ],
        queryFn: () =>
            checkExistingNameChangeEligibilityQuery(
                planCode as string,
                policyNumber as string,
                selectedPolicyParty?.partyId as string
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligibleExistingNameChange:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    // for header text siblings group one
    // pronouns and edit button
    const getPronouns = (partyType: string | undefined) => {
        const pronouns = (selectedPolicyParty as any)?.pronouns;
        if (!partyType || partyType !== PartyType.INDIVIDUAL || !pronouns) {
            return null;
        }

        return (
            <div className={styles.pronounsRow}>
                <p className={styles.pronounsText}>{pronouns}</p>
                <NavElement
                    type={NavElementType.Button}
                    size={NavElementSize.Small}
                    tabIndex={0}
                    className={styles.editButton}
                >
                    <EditIcon height={16} />
                </NavElement>
            </div>
        );
    };

    // for header text siblings group two
    // date of birth
    const getDateOfBirth = (
        partyType: string | undefined
    ): JSX.Element | null => {
        if (!partyType || partyType !== PartyType.INDIVIDUAL || isAgent) {
            return null;
        } else {
            const ageInYears = calculateAgeNumber(
                selectedPolicyParty?.dateOfBirth
            );
            return (
                <div>
                    <span className={styles.dobLabel}>
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

    // When an icon is shown, offset role tags to align with the person's name
    const partyRoleTags = (
        <div className={icon ? styles.roleTagsWithIcon : styles.roleTagsRow}>
            <div className={styles.tagsList}>
                {tags?.map((tag: { text: string }) => (
                    <span key={tag.text} className={styles.tagItem}>
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
            editable={
                existingNameChangeEligibility?.isEligibleExistingNameChange
            }
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
                {getDateOfBirth(selectedPolicyParty?.partyType)}
            </HeaderInfoCard>
        ) : (
            <div className={styles.groupTwoFallback}>
                {getPrefCommunicationType(selectedPolicyParty ?? null, t)}
                {getDateOfBirth(selectedPolicyParty?.partyType)}
            </div>
        );
    const subHeaderChildren = partyRoleTags;
    const headerRowFlexClassNames = styles.headerRowFlex;
    const groupOneFlexClassNames = styles.groupOneFlex;

    return (
        <PageHeader
            icon={icon}
            headerText={headerText}
            headerTextSiblingsGroupOne={headerTextSiblingsGroupOne}
            headerTextSiblingsGroupTwo={headerTextSiblingsGroupTwo}
            subHeaderTextChildren={subHeaderChildren}
            belowHeaderTextChildren={belowHeaderTextChildren}
            headerRowFlexClassNames={headerRowFlexClassNames}
            groupOneFlexClassNames={groupOneFlexClassNames}
        />
    );
};

export default InteriorPeoplePageHeaderContainer;
