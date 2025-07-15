import { Policy, PartyRole } from '@zinnia/api-types/types/sor';
import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo } from 'react';

import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import {
    combineNameAndRoles,
    NameTag,
    normalizePartyRole,
} from '@deps/containers/people-sub-page/people-sub-page.helpers';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { isEndDated } from '@deps/helpers/date.helpers';
import { sortByAndThenBy } from '@deps/helpers/sort.helpers';

import { validateBeneData } from './bene-details-step.helpers';
import { useBeneChange } from '../../../bene-change-provider';
import BeneficiaryListing from '../../beneficiary-details/beneficiary-listing/beneficiary-listing';

interface BeneDetailsStepProps {
    policy: Policy;
    parentPage: ParentPage;
    leaveTransactionLink: string;
}

const BeneDetailsStep = ({
    policy,
    parentPage,
    leaveTransactionLink,
}: BeneDetailsStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'beneChange.beneDetails',
    });

    const { t: tBene } = useTranslation();
    const { carrierId } = policy;
    const { goToNext } = useWorkflow();
    const {
        peopleSelection,
        beneData,
        formErrors,
        setFormErrors,
        setPeopleSelection,
    } = useBeneChange();

    const handleStepContinue = useCallback(() => {
        const formErrors = validateBeneData(beneData, t);
        if (Object.keys(formErrors).length > 0) {
            setFormErrors(formErrors);
        } else {
            goToNext();
        }
    }, [beneData, t, setFormErrors, goToNext]);

    const extractedParties = useMemo(() => policy?.parties || [], [policy]);
    const extractedPartyRoles = useMemo(
        () =>
            policy?.partyRoles?.filter(
                (role) => !role.endDate || !isEndDated(role.endDate)
            ) || [],
        [policy]
    );
    const nameTags = useMemo(
        () => combineNameAndRoles(extractedParties, extractedPartyRoles, tBene),
        [extractedParties, extractedPartyRoles, tBene]
    );

    const filteredNameTags = useMemo(() => {
        return sortByAndThenBy<NameTag>(
            nameTags.filter((nameTag) =>
                nameTag.partyRoles.some(
                    (partyRole) =>
                        normalizePartyRole(partyRole as PartyRole) ===
                        'beneficiary'
                )
            ),
            'fullName',
            'fullName'
        );
    }, [nameTags]);

    useEffect(() => {
        setPeopleSelection((prevState) => ({
            ...prevState,
            cardActionData: {
                filteredData: filteredNameTags,
                isBeneficiarySelected: true,
                isAgentSelected: false,
            },
        }));
    }, [filteredNameTags]);

    return (
        <WorkflowCard
            title={t('header')}
            footerContent={
                <TransactionNavigationButtons
                    disableContinue={false}
                    handleContinue={handleStepContinue}
                    parentPage={parentPage}
                    leaveTransactionLink={leaveTransactionLink}
                />
            }
        >
            <BeneficiaryListing
                parties={peopleSelection?.cardActionData?.filteredData || []}
                carrierId={carrierId as string}
                policy={policy}
            />
            {formErrors.firstNamesRequired ? (
                <AssistiveText
                    text={formErrors.firstNamesRequired}
                    variant={AssistiveTextVariant.Error}
                    className="mt-2"
                />
            ) : null}
            {formErrors.addressesRequired ? (
                <AssistiveText
                    text={formErrors.addressesRequired}
                    variant={AssistiveTextVariant.Error}
                    className="mt-2"
                />
            ) : null}
            {formErrors.allocationRequired ? (
                <AssistiveText
                    text={formErrors.allocationRequired}
                    variant={AssistiveTextVariant.Error}
                    className="mt-2"
                />
            ) : null}

            {formErrors.primaryBeneficiaryAllocationsSum ? (
                <AssistiveText
                    text={formErrors.primaryBeneficiaryAllocationsSum}
                    variant={AssistiveTextVariant.Error}
                    className="mt-2"
                />
            ) : null}

            {formErrors.contingentBeneficiaryAllocationsSum ? (
                <AssistiveText
                    text={formErrors.contingentBeneficiaryAllocationsSum}
                    variant={AssistiveTextVariant.Error}
                    className="mt-2"
                />
            ) : null}
        </WorkflowCard>
    );
};

export default BeneDetailsStep;
