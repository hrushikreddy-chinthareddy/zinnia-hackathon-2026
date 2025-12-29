import { useQueries } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import {
    combineNameAndRoles,
    NameTag,
} from '@deps/containers/people-sub-page/people-sub-page.helpers';
import { isEndDated } from '@deps/helpers/date.helpers';
import AgentParty from '@deps/helpers/policy-sor/AgentParty';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { toTitleCase } from '@deps/helpers/string.helpers';
import { getAgentDataQuery } from '@deps/queries/tanstack/policyQueries/policyQueries';
import { AgentData } from '@deps/types/agents';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import { PartyType, Policy, PartyRole } from '@zinnia/api-types/types/sor';

import { getApplicationDetailsData } from '../../policy-details.helpers';

const BASE_KEY = 'policy.detailCards.applicationDetails.';

export interface ApplicationDetailsCardData {
    issueState: string;
    salesChannel: string;
    originalPolicyNumber: string;
    applicationSource: string;
    applicationSourceDetails: string;
    multiPolicyDiscount: string | null;
}

interface AnnuityApplicationDetailsCardProps {
    policy: Policy;
}

export function AnnuityApplicationDetailsCard({
    policy,
}: AnnuityApplicationDetailsCardProps) {
    const { t } = useTranslation();
    const clientCode = policy?.carrierId;
    const policyDetails = useMemo(() => new PolicyDetails(policy), [policy]);
    const applicationDetailsData = getApplicationDetailsData(policyDetails, t);
    const extractedParties = useMemo(() => policy?.parties || [], [policy]);
    // if there's an enddate and the enddate is in the past, that role is no longer valid
    const extractedPartyRoles = useMemo(
        () =>
            policy?.partyRoles?.filter(
                (role) => !role.endDate || !isEndDated(role.endDate)
            ) || [],
        [policy]
    );

    const nameTags = useMemo(
        () => combineNameAndRoles(extractedParties, extractedPartyRoles, t),
        [extractedParties, extractedPartyRoles, t]
    );

    // Fetch data for agents if there are any
    let agentParties = useMemo(
        () =>
            nameTags?.filter((party) => {
                return (
                    party.partyRoles.includes(
                        PartyRole.PRIMARYSERVICINGAGENT
                    ) ||
                    party.partyRoles.includes(PartyRole.PRIMARYWRITINGAGENT)
                );
            }),
        [nameTags]
    );

    const {
        data: agentDataMap,
        isLoading,
        hasError,
    } = useQueries({
        queries: agentParties?.map((agent) => ({
            queryKey: [
                'agentData',
                agent.agentExternalId,
                agent.partyId,
                clientCode,
                policy?.policyNumber,
                policy?.product?.planCode,
            ],
            queryFn: () =>
                getAgentDataQuery(
                    agent?.agentExternalId,
                    clientCode,
                    policy?.policyNumber,
                    policy?.product?.planCode
                ),
            enabled:
                policyDetails?.isAnnuity &&
                !!agent.agentExternalId &&
                !!clientCode &&
                !!policy.policyNumber &&
                !!policy.product?.planCode,
            select: (data: AgentData | undefined) =>
                data ? new AgentParty(data, agent) : undefined,
        })),
        combine: (results) => {
            const overallLoading = results.some((result) => result.isLoading);
            const overallError = results.some((result) => result.isError);
            const combinedData = results.map((result) => result.data);
            return {
                isLoading: overallLoading,
                hasError: overallError,
                data: combinedData,
            };
        },
    });

    //Add agent data if there is any
    if (agentDataMap && agentDataMap.length > 0) {
        agentParties = agentParties.map((tag) => {
            const isAgent = agentDataMap.some(
                (agent) => agent?.partyId === tag.partyId
            );
            if (isAgent) {
                const agent = agentDataMap.find(
                    (agent) => agent?.partyId === tag.partyId
                );
                return agent?.party as NameTag;
            } else {
                return tag;
            }
        });
    }

    const dispayAgentName = (agent: NameTag) => {
        return agent?.partyType === PartyType.INDIVIDUAL
            ? agent?.firstName === null
                ? DEFAULT_ERROR_STRING
                : toTitleCase(`${agent?.firstName} ${agent?.lastName}`)
            : toTitleCase(agent?.fullName);
    };

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-200">
            <Typography variant={TypographyVariant.H2}>
                {t(`${BASE_KEY}applicationDetails`)}
            </Typography>
            <div className="mt-4 flex flex-col gap-8 sm:flex-row">
                {isLoading ? (
                    <div className="flex w-full justify-center items-center">
                        <PageLoader variant={PageLoaderVariant.Center} />
                    </div>
                ) : hasError && agentParties.length === 0 ? (
                    <Typography variant={TypographyVariant.BodyParagraph}>
                        {DEFAULT_ERROR_STRING}
                    </Typography>
                ) : (
                    <>
                        {agentParties &&
                            agentParties.map((agent, index) => {
                                return (
                                    <div key={index}>
                                        <Label
                                            label={
                                                agent?.tags[0]?.text ??
                                                DEFAULT_ERROR_STRING
                                            }
                                            variant={LabelVariant.FieldLabel}
                                        />
                                        <NavElement
                                            href={`/policies/${policyDetails.planCode}/${policy.policyNumber}/people/${agent?.partyId}`}
                                            size={NavElementSize.Small}
                                            type={NavElementType.Link}
                                        >
                                            <PiiWrapper>
                                                {dispayAgentName(agent)}
                                            </PiiWrapper>
                                        </NavElement>
                                        <Content
                                            details={
                                                toTitleCase(agent?.partyType) ??
                                                DEFAULT_ERROR_STRING
                                            }
                                            variant={ContentVariant.BodySm}
                                        />
                                    </div>
                                );
                            })}
                        {applicationDetailsData.multiPolicyDiscount && (
                            <div>
                                <Label
                                    label={t(`${BASE_KEY}multiPolicyDiscount`)}
                                    variant={LabelVariant.FieldLabel}
                                />
                                <Content
                                    details={
                                        applicationDetailsData.multiPolicyDiscount
                                    }
                                    variant={ContentVariant.BodySm}
                                />
                            </div>
                        )}
                        <div>
                            <Label
                                label={t(`${BASE_KEY}salesChannel`)}
                                variant={LabelVariant.FieldLabel}
                            />
                            <Content
                                details={
                                    applicationDetailsData?.salesChannel ??
                                    DEFAULT_ERROR_STRING
                                }
                                variant={ContentVariant.BodySm}
                            />
                        </div>
                    </>
                )}
            </div>
        </CardContainer>
    );
}
