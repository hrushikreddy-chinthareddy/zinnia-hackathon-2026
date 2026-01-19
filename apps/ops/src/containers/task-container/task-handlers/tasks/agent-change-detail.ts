import { isEndDated } from '@deps/helpers/date.helpers';
import { TaskStatus } from '@deps/models/case/task-instance';
import { NigoSearch } from '@deps/queries/api/nigo-search';
import { getPolicyDetailsSsr } from '@deps/queries/api/policies';
import { LoggingContext } from '@deps/utils/server-logging';

import { getCheckBoxesSelectWidgetUiSchema } from '../../task.helpers';
import {
    TaskHandler,
    Reason,
    PartyRoleType,
    PolicyResponse,
    AgentTaskPayload,
} from '../types';

type SignatureData = {
    signType: string | null;
    signDate: string | null;
    signDesignation: string | null;
    isSignedPresent: boolean;
};

const formatAgents = (policyResponse: PolicyResponse) => {
    if (!policyResponse || !policyResponse.partyRoles) {
        return [];
    }
    const getAgentsByRole = (roleType: string) => {
        const roles = policyResponse.partyRoles.filter(
            (role) =>
                role.partyRole === roleType &&
                (!role.endDate || !isEndDated(role.endDate))
        );

        return roles.map((role) => {
            const party = policyResponse.parties.find(
                (p) => p.partyId === role.partyId
            );

            return {
                action: 'NONE',
                partyRole: roleType,
                party,
            };
        });
    };

    const primaryWritingAgents = getAgentsByRole(
        PartyRoleType.PRIMARYWRITINGAGENT
    );
    const primaryServicingAgents = getAgentsByRole(
        PartyRoleType.PRIMARYSERVICINGAGENT
    );

    return [...primaryWritingAgents, ...primaryServicingAgents];
};

const agentChangeHandler: TaskHandler<AgentTaskPayload, any> = {
    api: async (payload: AgentTaskPayload, accessToken: string | undefined) => {
        const {
            category,
            businessProcess,
            carrier,
            policyNumber,
            planCode,
            logCtx,
        } = payload;
        const [nigoSearchResult, policyResult] = await Promise.all([
            NigoSearch(
                {
                    category,
                    businessProcess,
                    carrier,
                },
                accessToken,
                (logCtx ?? {}) as LoggingContext
            ),
            getPolicyDetailsSsr(
                policyNumber,
                planCode,
                accessToken,
                (logCtx ?? {}) as LoggingContext
            ),
        ]);
        return {
            nigoSearchResult,
            policyResult,
        };
    },

    getPayload: (task: any, logCtx?: LoggingContext) => ({
        category: ['Agent change'],
        businessProcess: task?.process,
        carrier: task.carrier,
        policyNumber: task?.data?.policyNumber,
        planCode: task?.data?.planCode,
        logCtx,
    }),

    transformResponse: async (response, metadata, task) => {
        if (!response || response.length === 0) return;

        const nigoResponse = response?.nigoSearchResult;
        const policyResponse = response?.policyResult;

        const reasonList: Reason[] = Array.from(
            new Set(nigoResponse.map((item: any) => item))
        );

        const seen = new Set<string>();
        const declineReasonEnum: string[] = [];
        const declineReasonOptions: {
            label: string;
            value: string;
            category: string;
            reason: string;
            detailedReason: string;
            selectOptions: any;
        }[] = [];

        for (const r of reasonList) {
            if (!seen.has(r.detailedReason)) {
                seen.add(r.detailedReason);

                const selectOptions =
                    r.exceptionSubRefs
                        ?.filter(
                            (item: any) =>
                                item.carrier === task?.carrier &&
                                item.process === task?.process
                        )
                        ?.map((item: any) => ({
                            label: item.subNmIdDetail,
                            value: item.subNmId,
                        })) || [];

                if (selectOptions.length > 0) {
                    declineReasonEnum.push(r.detailedReason);
                    declineReasonOptions.push({
                        label: r.detailedReason,
                        value: r.nmId,
                        category: r.category,
                        reason: r.reason,
                        detailedReason: r.detailedReason,
                        selectOptions,
                    });
                }
            }
        }
        metadata[0].uiSchema.declineReason = getCheckBoxesSelectWidgetUiSchema({
            enumOptions: declineReasonOptions,
            dataPath: ['declineReason'],
        });

        if (task) {
            const formattedAgents = formatAgents(policyResponse).map(
                (partyUpdates: {
                    action: string;
                    partyRole: string;
                    party: any;
                }) => ({
                    action: partyUpdates.action,
                    partyRole: partyUpdates.partyRole,
                    party: {
                        ...partyUpdates.party,
                        partyPercentage: partyUpdates.party?.partyPercentage,
                        agentExternalId: partyUpdates.party?.agentExternalId,
                    },
                })
            );

            const taskData = {
                ...task.data,
                partyUpdates:
                    task.status === TaskStatus.Completed
                        ? task.data.partyUpdates
                        : formattedAgents,
                signatures:
                    task.data?.signatures?.length > 0
                        ? task.data.signatures.map(
                              (sig: SignatureData): SignatureData => ({
                                  signType: sig.signType || null,
                                  signDate: sig.signDate || null,
                                  signDesignation: sig.signDesignation || null,
                                  isSignedPresent: sig.isSignedPresent || false,
                              })
                          )
                        : [
                              {
                                  signType: null,
                                  signDate: null,
                                  signDesignation: null,
                                  isSignedPresent: false,
                              },
                          ],
                issueResolved: task?.data?.issueResolved ?? true,
            };

            Object.assign(task, { data: taskData });
        }
    },
};

export default agentChangeHandler;
