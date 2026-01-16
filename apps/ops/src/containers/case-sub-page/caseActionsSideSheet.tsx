import { HttpStatusCode } from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button, {
    ButtonSize,
    ButtonVariant,
} from '@deps/components/button/button';
import Checkbox from '@deps/components/checkbox/checkbox';
import { FieldSize } from '@deps/components/fields/field';
import Select from '@deps/components/select/select';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { CaseAction } from '@deps/models/case/enums';
import { escalateCase } from '@deps/queries/api/cases';
import { browserLogError } from '@deps/utils/browser-logging';

import SuccessErrorSideSheet from './success-error-side-sheet';

interface Props {
    caseId: string;
    action: CaseAction;
}

function CaseActionSideSheet({ caseId, action }: Props) {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: `caseOverview.${action}Case`,
    });
    const [error, setError] = useState<string | undefined>();
    const [reason, setReason] = useState('');
    const [source, setSource] = useState('');
    const [reasonError, setReasonError] = useState<string | undefined>();
    const [sourceError, setSourceError] = useState<string | undefined>();
    const [notify, setNotify] = useState(false);
    const sideSheet = useSideSheetContext();

    const handleSubmit = async () => {
        const isPrioritize = action === CaseAction.Prioritize;

        if (!reason) {
            setReasonError(t('reasonRequired') as string);
        } else {
            setReasonError(undefined);
        }

        if (!source) {
            setSourceError(t('sourceRequired') as string);
        } else {
            setSourceError(undefined);
        }

        if (!reason || !source) {
            return;
        }

        try {
            const response = await escalateCase(
                caseId,
                isPrioritize,
                reason,
                source
            );
            if (response) {
                const content = (
                    <SuccessErrorSideSheet
                        response={response}
                        sideSheet={sideSheet}
                        successMessage={t('successMessage', { caseId })}
                        errorMessage={
                            response.status === HttpStatusCode.Forbidden
                                ? t('errorForbidden')
                                : t('errorMessage', {
                                      error: response.data?.message ?? '',
                                  })
                        }
                    />
                );
                sideSheet.changeSideSheetContent(t('title'), content);
                sideSheet.handleOpen(true);
            }
        } catch (error) {
            browserLogError(
                `${action}escalateCaseCase :${caseId} : error : ${error}`
            );
            setError(error as string);
        }
    };

    return (
        <div className="flex flex-col py-10 pl-10 pr-5 justify-between h-full">
            <div className="flex flex-col gap-4 ">
                <Typography variant={TypographyVariant.H3}>
                    {t('detailsHeader')}
                </Typography>
                <Typography variant={TypographyVariant.Body}>
                    {t('detailsBody')}
                </Typography>

                <div className="flex flex-col gap-4 max-w-md">
                    <Select
                        label={t('reasonLabel') as string}
                        size={FieldSize.Small}
                        options={
                            action === CaseAction.Prioritize
                                ? [
                                      { label: 'SLA Risk', value: 'SLA_RISK' },
                                      {
                                          label: 'Customer Threatened Cancellation',
                                          value: 'CUSTOMER_THREATENED_CANCELLATION',
                                      },
                                      {
                                          label: 'Compliance / Regulatory Breach',
                                          value: 'COMPLIANCE_REGULATORY_BREACH',
                                      },
                                      {
                                          label: 'Financial Issue',
                                          value: 'FINANCIAL_ISSUE',
                                      },
                                      {
                                          label: 'Operational Error Correction',
                                          value: 'OPERATIONAL_ERROR_CORRECTION',
                                      },
                                      {
                                          label: 'Key Account / Customer',
                                          value: 'KEY_ACCOUNT_CUSTOMER',
                                      },
                                      {
                                          label: 'Agent / Distributor Escalation',
                                          value: 'AGENT_DISTRIBUTOR_ESCALATION',
                                      },
                                      {
                                          label: 'System Issue',
                                          value: 'SYSTEM_ISSUE',
                                      },
                                      {
                                          label: 'Imminent Policy Impact',
                                          value: 'IMMINENT_POLICY_IMPACT',
                                      },
                                      {
                                          label: 'Urgent Payment / Disbursement Issue',
                                          value: 'URGENT_PAYMENT_DISBURSEMENT_ISSUE',
                                      },
                                      {
                                          label: 'Customer Emergency',
                                          value: 'CUSTOMER_EMERGENCY',
                                      },
                                      {
                                          label: 'Fraud Concern',
                                          value: 'FRAUD_CONCERN',
                                      },
                                  ]
                                : [
                                      {
                                          label: 'SLA Risk No Longer Applicable',
                                          value: 'SLA_RISK_NO_LONGER_APPLICABLE',
                                      },
                                      {
                                          label: 'Customer Concern Addressed',
                                          value: 'CUSTOMER_CONCERN_ADDRESSED',
                                      },
                                      {
                                          label: 'Compliance / Regulatory Risk Cleared',
                                          value: 'COMPLIANCE_REGULATORY_RISK_CLEARED',
                                      },
                                      {
                                          label: 'Financial Impact Mitigated',
                                          value: 'FINANCIAL_IMPACT_MITIGATED',
                                      },
                                      {
                                          label: 'Operational Reassessment',
                                          value: 'OPERATIONAL_REASSESSMENT',
                                      },
                                      {
                                          label: 'System Issue Resolved',
                                          value: 'SYSTEM_ISSUE_RESOLVED',
                                      },
                                      {
                                          label: 'Urgency Downgraded by Customer',
                                          value: 'URGENCY_DOWNGRADED_BY_CUSTOMER',
                                      },
                                      {
                                          label: 'Incorrect Prioritization',
                                          value: 'INCORRECT_PRIORITIZATION',
                                      },
                                      {
                                          label: 'Task Specific Urgency Addressed',
                                          value: 'TASK_SPECIFIC_URGENCY_ADDRESSED',
                                      },
                                  ]
                        }
                        value={reason}
                        onChange={setReason}
                        placeholder={t('reasonPlaceholder') as string}
                        name="case-prioritization-reason"
                        message={reasonError}
                    />
                    <Select
                        label={t('sourceLabel') as string}
                        size={FieldSize.Small}
                        options={[
                            { label: 'Call Center', value: 'CALL_CENTER' },
                            { label: 'Internal', value: 'INTERNAL' },
                            { label: 'Email', value: 'EMAIL' },
                        ]}
                        value={source}
                        onChange={setSource}
                        placeholder={t('sourcePlaceholder') as string}
                        name="case-prioritization-source"
                        message={sourceError}
                    />
                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={notify}
                            onChange={(isChecked: boolean) =>
                                setNotify(isChecked)
                            }
                        />
                        <Typography variant={TypographyVariant.Body}>
                            {t('notificationLabel') as string}
                        </Typography>
                    </div>
                </div>

                <div className="flex gap-2 items-end width-full justify-end pr-5">
                    <Button
                        variant={ButtonVariant.Selected}
                        size={ButtonSize.Small}
                        onClick={() => sideSheet.handleOpen(false)}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        variant={ButtonVariant.Default}
                        size={ButtonSize.Small}
                        onClick={handleSubmit}
                    >
                        {t('submit')}
                    </Button>
                </div>
            </div>

            <div className=" flex-1 justify-start  items-end flex">
                {error && (
                    <Typography variant={TypographyVariant.H3}>
                        {t('errorMessage', { error })}
                    </Typography>
                )}
            </div>
        </div>
    );
}

export default CaseActionSideSheet;
