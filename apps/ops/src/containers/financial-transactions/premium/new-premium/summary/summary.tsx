import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import BannerAlert, {
    BannerVariant,
} from '@deps/components/banner-alert/banner-alert';
import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Label, { LabelVariant } from '@deps/components/label/label';
import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import PayeeSummaryCard from '@deps/containers/payee-summary-card/payee-summary-card';
import { usePremium } from '@deps/contexts/transactions/NewPremiumContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import {
    TransactionResponseStatus,
    ValidationResult,
} from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { ReactComponent as UserIcon } from '@deps/styles/elements/icons/actions/user.svg';
import {
    DEFAULT_DATE_FORMAT,
    NUMERIC_DATE_FORMAT,
} from '@deps/types/constants';
import { TransactionStep } from '@deps/types/segment-analytics';
import {
    Address,
    Policy,
    TransactionTypeEnum,
} from '@zinnia/api-types/types/sor';

interface SummaryProps {
    policy: Policy;
}

const Summary = ({ policy }: SummaryProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'newPremium.summary',
    });
    const { policyNumber, product } = policy;
    const { premium } = usePremium();
    const [showSelectionError, setShowSelectionError] =
        useState<boolean>(false);
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const { goToNext } = useWorkflow();

    const {
        effectiveDate,
        paymentAccountNumber,
        paymentBranchName,
        paymentAmount,
        payorAddress,
        payorFullName,
        validationResponse,
        paymentForm,
    } = premium;

    const validationSucceeded = useMemo(
        () => validationResponse?.status === TransactionResponseStatus.Success,
        [validationResponse]
    );
    const bannerResults = validationResponse?.validationResult;
    const statusResponse = validationResponse?.status;
    const internalServerCTA = {
        text: t('internal500CTAlinkText'),
        href: t('internal500CTAlink'),
    };

    const handleContinue = async () => {
        if (!validationSucceeded && !isChecked) {
            setShowSelectionError(true);

            return;
        } else {
            setShowSelectionError(false);
            goToNext();
        }
    };

    return (
        <div className="rounded">
            <CardContainer classNames="flex w-full flex-col items-start text-gray-900">
                <Typography variant={TypographyVariant.H1}>
                    {t('label')}
                </Typography>
                <Typography
                    className="mb-6 mt-2"
                    variant={TypographyVariant.Body}
                >
                    {validationSucceeded
                        ? t('status200subtitle')
                        : t('status400subtitle')}
                </Typography>
                <div className="flex w-full flex-row gap-8">
                    <div className="flex flex-col">
                        <Label
                            variant={LabelVariant.FieldLabel}
                            label={t('paymentLabel')}
                        />
                        <Typography variant={TypographyVariant.Value}>
                            {numberFormatify(paymentAmount)}
                        </Typography>
                    </div>

                    <div className="flex flex-col">
                        <Label
                            variant={LabelVariant.FieldLabel}
                            label={t('effectiveDateLabel')}
                        />
                        <Typography variant={TypographyVariant.Value}>
                            {dayjs(effectiveDate, NUMERIC_DATE_FORMAT).format(
                                DEFAULT_DATE_FORMAT
                            )}
                        </Typography>
                    </div>
                </div>
            </CardContainer>

            <hr className="content-divider w-[100%]" />

            <CardContainer>
                <div className="mb-4 flex flex-row items-center">
                    <UserIcon
                        className="mr-2 text-primary"
                        height={24}
                        width={24}
                    />
                    <Typography variant={TypographyVariant.H2} className="mr-5">
                        {t('payorTitle')}
                    </Typography>
                </div>

                <PayeeSummaryCard
                    accountNumber={paymentAccountNumber}
                    address={payorAddress as Address}
                    branchName={paymentBranchName}
                    classNames="max-w-[524px]"
                    payeeName={payorFullName}
                    paymentType={paymentForm}
                    showFinancialData={false}
                />

                {!validationSucceeded && (
                    <div className="mt-10 flex flex-col gap-2">
                        {statusResponse === StatusCode.InternalServerError ? (
                            bannerResults?.map(
                                (result: ValidationResult, index: number) => (
                                    <BannerAlert
                                        key={index}
                                        variant={BannerVariant.Error}
                                        canDismiss={false}
                                        cta={
                                            statusResponse ===
                                            StatusCode.InternalServerError
                                                ? internalServerCTA
                                                : undefined
                                        }
                                    >
                                        {t('internal500Error')}
                                    </BannerAlert>
                                )
                            )
                        ) : (
                            <>
                                {bannerResults?.map(
                                    (
                                        result: ValidationResult,
                                        index: number
                                    ) => (
                                        <BannerAlert
                                            key={index}
                                            variant={BannerVariant.Error}
                                            canDismiss={false}
                                        >
                                            ${result.error} ${result.resolution}
                                        </BannerAlert>
                                    )
                                )}
                                <div className="my-6 flex flex-row">
                                    <CheckboxText
                                        label={t('submitWithErrorsText')}
                                        checked={isChecked}
                                        onChange={() =>
                                            setIsChecked(!isChecked)
                                        }
                                    />
                                </div>
                            </>
                        )}
                        {showSelectionError && !isChecked && (
                            <AssistiveText
                                variant={AssistiveTextVariant.Error}
                                text={t('missingCheckToConfirm')}
                            />
                        )}
                    </div>
                )}

                <TransactionNavigationButtons
                    className="mt-10"
                    disableContinue={
                        statusResponse === StatusCode.InternalServerError
                    }
                    handleContinue={handleContinue}
                    parentPage={ParentPage.Premiums}
                    planCode={product?.planCode}
                    policyNumber={policyNumber}
                    trackEventProps={{
                        type: TransactionTypeEnum.PAYMENT_ONE_TIME_PREMIUM,
                        step: TransactionStep.Summary,
                    }}
                />
            </CardContainer>
        </div>
    );
};

export default Summary;
