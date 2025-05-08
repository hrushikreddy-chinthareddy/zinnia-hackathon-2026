import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import Button, { ButtonSize, ButtonType } from '@deps/components/button/button';
import CardInfo from '@deps/components/card/card-info/card-info';
import CaseDocumentSelect, { CaseDocumentOption, SetStateCaseId } from '@deps/components/case-document-select/case-document-select';
import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import FieldData from '@deps/components/fields/field-data/field-data';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { Errors } from '@deps/containers/people-data-cards/address-card/side-sheet/side-sheet-address.helpers';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { Processes } from '@deps/models/case/case';
import { reverseRecreateTransaction } from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import { ReactComponent as HexExclamationIcon } from '@deps/styles/elements/icons/icons_outlined/hex-exclamation.svg';

import { HELP_DESK_LINK } from '../non-financial-transactions/states/api-error-state';
import LoadingState from '../non-financial-transactions/states/loading-state';
import { ViewState } from '../non-financial-transactions/states/states.helpers';

type SidesheetReverseRecreateProps = {
    amount?: number;
    effectiveDate: string | undefined;
    exitTransaction: () => void;
    closeSidesheet: () => void;
    planCode: string | undefined;
    policyNumber: string | undefined;
    reversalTransactionId: string | undefined;
    transactionType: string;
};

export default function SidesheetReverseRecreate({
    amount,
    closeSidesheet,
    effectiveDate,
    exitTransaction,
    planCode,
    policyNumber,
    reversalTransactionId,
    transactionType,
}: SidesheetReverseRecreateProps) {
    const { t } = useTranslation();
    const [viewState, setViewState] = useState(ViewState.Default);
    const [checked, toggleChecked] = useState(false);
    const [showConfirmSelectionError, setShowConfirmSelectionError] = useState(false);

    const [caseDocumentOptions, setCaseDocumentOptions] = useState<CaseDocumentOption[]>([]);
    const [documentViewState, setDocumentViewState] = useState(ViewState.Default);
    const [currentErrors, setCurrentErrors] = useState<Errors>();

    const [caseIdBody, setCaseIdBody] = useState({ caseId: undefined });
    const { caseId } = caseIdBody;

    const amountString = numberFormatify(amount);

    const reverseRecreate = async () => {
        setViewState(ViewState.Loading);

        const result = await reverseRecreateTransaction(planCode, policyNumber, undefined, reversalTransactionId, caseId);

        if (result.status === StatusCode.Accepted || result.status === StatusCode.Okay) {
            setViewState(ViewState.Success);
        } else {
            setViewState(ViewState.ApiError);
        }
    };

    const handleReverseRecreate = () => {
        if (!caseId) {
            setCurrentErrors({ caseId: t('workflows.start.missingSelection') as string });
        }
        if (!checked) {
            setShowConfirmSelectionError(true);
        }
        if (checked) {
            setCurrentErrors({});
            reverseRecreate();
        }
    };

    const handleCheckboxChange = () => {
        if (!checked) {
            setShowConfirmSelectionError(false);
        }
        toggleChecked(!checked);
    };

    switch (viewState) {
        case ViewState.ApiError:
            return (
                <CardInfo
                    className="mt-8"
                    cta={{ action: reverseRecreate, text: t('policy.history.reverseRecreateSidesheet.reversePremiumPayment') }}
                    icon={<HexExclamationIcon className="text-semantic-error" height={50} width={50} />}
                    subtitle={
                        <>
                            {t('policy.history.reverseRecreateSidesheet.apiError.subtitle')}
                            <NavElement
                                href={HELP_DESK_LINK}
                                target="_blank"
                                type={NavElementType.Link}
                                variant={NavElementVariant.Secondary}
                            >
                                {t('policy.history.reverseRecreateSidesheet.apiError.submitHelpDeskTicket')}
                            </NavElement>
                        </>
                    }
                    title={t('policy.history.reverseRecreateSidesheet.apiError.title')}
                />
            );
        case ViewState.Loading:
            return <LoadingState />;
        case ViewState.Default:
            return (
                <div className="m-8">
                    {documentViewState === ViewState.Loading ? (
                        <LoadingState />
                    ) : (
                        <CaseDocumentSelect
                            caseId={caseId}
                            caseDocumentOptions={caseDocumentOptions}
                            currentErrors={currentErrors}
                            policyNumber={policyNumber}
                            processType={Processes.OneTimePremium}
                            setBody={setCaseIdBody as SetStateCaseId}
                            setCaseDocumentOptions={setCaseDocumentOptions}
                            setCurrentErrors={setCurrentErrors}
                            setViewState={setDocumentViewState}
                        />
                    )}
                    <div className="mb-8 mt-8 flex gap-8">
                        <FieldData
                            label={t('policy.history.reverseRecreateSidesheet.originalAppliedAmount')}
                            tooltipBody={t('policy.history.reverseRecreateSidesheet.appliedAmountBody')}
                            tooltipTitle={t('policy.history.reverseRecreateSidesheet.appliedAmountTitle')}
                        >
                            {amountString}
                        </FieldData>
                        <FieldData
                            label={t('policy.history.reverseRecreateSidesheet.effectiveDate')}
                            tooltipBody={t('policy.history.reverseRecreateSidesheet.effectiveDateBody')}
                            tooltipTitle={t('policy.history.reverseRecreateSidesheet.effectiveDate')}
                        >
                            {effectiveDate}
                        </FieldData>
                    </div>
                    <CheckboxText
                        label={t('policy.history.reverseRecreateSidesheet.confirmationCheckbox', {
                            amount: amountString,
                            effectiveDate: effectiveDate,
                        })}
                        checked={checked}
                        onChange={handleCheckboxChange}
                        className="!items-start"
                    />
                    {showConfirmSelectionError && (
                        <AssistiveText variant={AssistiveTextVariant.Error} text={t('policy.history.reverseRecreateSidesheet.alert')} />
                    )}
                    <div className="mt-10 flex items-center gap-8">
                        <Button onClick={handleReverseRecreate} size={ButtonSize.Small} type={ButtonType.Primary}>
                            {t('policy.history.reverseRecreateSidesheet.reversePremiumPayment')}
                        </Button>
                        <NavElement
                            onClick={() => exitTransaction()}
                            type={NavElementType.Button}
                            variant={NavElementVariant.Default}
                            size={NavElementSize.Small}
                        >
                            {t('policy.history.reverseRecreateSidesheet.cancel')}
                        </NavElement>
                    </div>
                </div>
            );
        case ViewState.Success:
            return (
                <CardInfo
                    className="mt-8"
                    cta={{ action: closeSidesheet, text: t('general.close') }}
                    icon={<CircleCheckIcon className="text-semantic-success" height={50} width={50} />}
                    subtitle={
                        <>
                            {t('policy.history.reverseRecreateSidesheet.successSubtitle')}
                            <span className="font-bold">
                                {t(`policy.history.reverseRecreateSidesheet.transactionTypes.${transactionType}`)}
                            </span>
                            {t('policy.history.reverseRecreateSidesheet.successSubtitle2')}
                            <span className="font-bold">{amountString}</span>
                            {t('policy.history.reverseRecreateSidesheet.successSubtitle3')}
                            <span className="font-bold">{'$0.00'}</span>
                            {t('policy.history.reverseRecreateSidesheet.successSubtitle4')}
                            <span className="font-bold">{effectiveDate}</span>
                            {t('policy.history.reverseRecreateSidesheet.successSubtitle5')}
                        </>
                    }
                    title={t('policy.history.reverseRecreateSidesheet.successTitle')}
                />
            );
        default:
            return null;
    }
}
