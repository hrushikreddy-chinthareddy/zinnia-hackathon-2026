import dayjs from 'dayjs';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import { coerceFullRjsfOutputMonolithicAddresses } from '@deps/lib/transaction-builder/coerce-monolithic-address-fields';
import type { FullRjsfOutput } from '@deps/lib/transaction-builder/pipeline-types';
import {
    fullRjsfOutputToTaskMetadata,
    seedPreviewTaskDataFromOutput,
} from '@deps/lib/transaction-builder/rjsf-output-task-preview';
import { Processes } from '@deps/models/case/case';
import type { FormMetadata, TabSchema } from '@deps/models/case/task';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { Policy } from '@zinnia/api-types/types/sor';

import { applyAiPaperSemanticPrefill } from './ai-paper-prefill-mapping';
import { buildInitialAnnuitantChangeFormData } from './annuitant-change-transaction';
import { buildInitialAssigneeChangeFormData } from './assignee-change-transaction';
import { buildInitialBeneChangeFormData } from './bene-change-transaction';
import { buildInitialPayeeChangeFormData } from './payee-change-transaction';
import {
    SelfServeTransaction,
    SelfServeTransactionSubmitResult,
} from '../types';

import type { RJSFSchema } from '@rjsf/utils';

/** Dev / mock task type — not sent to BPM in v1 (metadata is in-memory only). */
export const AI_PAPER_GENERATED_TASK_TYPE = 'AI_PAPER_GENERATED_TASK';

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMergeFormPrefill(
    seed: Record<string, unknown>,
    prefill: Record<string, unknown>
): Record<string, unknown> {
    const out: Record<string, unknown> = { ...seed };
    for (const [key, val] of Object.entries(prefill)) {
        if (isPlainObject(val) && isPlainObject(out[key])) {
            out[key] = deepMergeFormPrefill(
                out[key] as Record<string, unknown>,
                val
            );
        } else {
            out[key] = val;
        }
    }
    return out;
}

function resolvePrefillFromPolicy(
    policy: Policy,
    output: FullRjsfOutput
): Record<string, unknown> {
    const hint = `${output.processSubType} ${output.taskType} ${
        output.generationMeta?.archetype ?? ''
    }`.toLowerCase();
    if (hint.includes('bene') || hint.includes('beneficiary')) {
        return buildInitialBeneChangeFormData(policy) as Record<
            string,
            unknown
        >;
    }
    if (hint.includes('annuitant')) {
        return buildInitialAnnuitantChangeFormData(policy) as Record<
            string,
            unknown
        >;
    }
    if (hint.includes('assignee')) {
        return buildInitialAssigneeChangeFormData(policy) as Record<
            string,
            unknown
        >;
    }
    if (hint.includes('payee')) {
        return buildInitialPayeeChangeFormData(policy) as Record<
            string,
            unknown
        >;
    }
    return buildInitialBeneChangeFormData(policy) as Record<string, unknown>;
}

export function buildInitialAiGeneratedFormData(
    policy: Policy,
    output: FullRjsfOutput
): Record<string, unknown> {
    const seed = seedPreviewTaskDataFromOutput(output) as Record<
        string,
        unknown
    >;
    const prefill = resolvePrefillFromPolicy(policy, output);
    const merged = deepMergeFormPrefill(seed, prefill);
    return applyAiPaperSemanticPrefill(policy, output, merged, true);
}

function resolveProcessSubTypesFromAiOutput(
    output: FullRjsfOutput
): Processes[] {
    const hint = `${output.processSubType} ${output.taskType} ${
        output.generationMeta?.archetype ?? ''
    }`.toLowerCase();
    if (hint.includes('annuitant')) {
        return [Processes.AnnuitantChange];
    }
    if (hint.includes('assignee')) {
        return [Processes.AssigneeChange];
    }
    if (hint.includes('payee')) {
        return [Processes.PayeeChange];
    }
    if (hint.includes('bene') || hint.includes('beneficiary')) {
        return [Processes.BeneficiaryChange, Processes.BeneficiaryUpdate];
    }
    return [Processes.BeneficiaryChange, Processes.BeneficiaryUpdate];
}

function buildAiPaperMetaData(fullRjsfOutput: FullRjsfOutput): FormMetadata {
    const tabSchemas = fullRjsfOutputToTaskMetadata(fullRjsfOutput);
    return {
        title: fullRjsfOutput.processSubType || 'AI generated',
        formSchema: { type: 'object', properties: {} } as RJSFSchema,
        uiSchema: { 'ui:submitButtonOptions': { norender: true } },
        schemaContent: {
            tabSchemas: tabSchemas as TabSchema[],
        },
    };
}

export const aiPaperMockSubmitHandler =
    (_policy: Policy, _sessionId: string, _partyId: string) =>
    async (_payload: unknown): Promise<SelfServeTransactionSubmitResult> => ({
        response: { mock: true, submittedAt: new Date().toISOString() },
        isSuccess: true,
        caseId: `MOCK-AI-${Date.now()}`,
    });

export function getAiPaperTransactionData(
    policy: Policy,
    planCode: string,
    fullRjsfOutput: FullRjsfOutput
) {
    const coercedOutput =
        coerceFullRjsfOutputMonolithicAddresses(fullRjsfOutput);
    const metaData = buildAiPaperMetaData(coercedOutput);
    return {
        metaData: JSON.parse(JSON.stringify(metaData)),
        initialCustomData: {
            policyNumber: policy.policyNumber,
            planCode,
            effectiveDate: dayjs.utc().format(ZAHARA_API_DATE_FORMAT),
            taskType: AI_PAPER_GENERATED_TASK_TYPE,
            issueResolved: true,
            carrier: policy.carrierId,
            policyStatus: policy.policyStatus,
            aiPaperProcessSubType: coercedOutput.processSubType,
        },
        initialFormData: buildInitialAiGeneratedFormData(policy, coercedOutput),
        transactionType: SelfServeTransaction.AI_PAPER,
        processType: Processes.PolicyUpdate,
        processSubType: resolveProcessSubTypesFromAiOutput(fullRjsfOutput),
        parentPage: ParentPage.CreateCase,
        leaveTransactionLink: '/',
        startStepSubtitle: 'aiPaper.subTitle',
        confirmStepSubtitle: 'aiPaper.confirmSubTitle',
        submitResponseHandler: aiPaperMockSubmitHandler,
    };
}
