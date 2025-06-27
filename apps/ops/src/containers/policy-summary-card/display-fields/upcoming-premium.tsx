import { Reason } from '@zinnia/api-types/types/sor';
import { PopoverPlacement } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import PolicyInfo from '@deps/components/global-values/policy-info/policy-info';
import Label, { LabelVariant } from '@deps/components/label/label';
import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import BankingDetails from '@deps/components/side-sheet/banking-details/banking-details';
import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { policyDataToGlobalValues } from '@deps/helpers/global-values';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';
import { formatAccountNumber, toTitleCase } from '@deps/helpers/string.helpers';
import {
    DEFAULT_ERROR_STRING,
    DEFAULT_EXTENDED_DATE_FORMAT,
} from '@deps/types/constants';

export const UpcomingPremium: React.FC<BasePolicyComponentArgs> = ({
    policy,
}: BasePolicyComponentArgs) => {
    const { t } = useTranslation([
        TranslationFiles.COMMON,
        TranslationFiles.COLDEFS,
    ]);
    const sideSheet = useSideSheetContext();

    const premiumProgram = policy.systematicPrograms.getProgramsByReason(
        Reason.PREMIUM
    );
    const paymentDate = premiumProgram?.nextProgramDate;
    const amount = premiumProgram?.amount;
    const { bankId, partyId } = premiumProgram?.party?.[0] || {};
    const bankDetails =
        partyId && bankId
            ? policy.getPartyById(partyId)?.banks?.getById(bankId)
            : undefined;

    // BPB - todo: keep moving this up
    const globalValuesData = useMemo(
        () => policyDataToGlobalValues(policy, t),
        [policy, t]
    );

    const amountAndDate = `${numberFormatify(amount || '')} - ${
        dayjs(paymentDate).format(DEFAULT_EXTENDED_DATE_FORMAT) || ''
    }`;

    let transactionLink;
    const openBankingSidesheet = () => {
        sideSheet.changeSideSheetContent(
            <PolicyInfo
                tooltipPlacements={PopoverPlacement.BottomLeft}
                {...globalValuesData}
            />,
            <BankingDetails bankDetails={bankDetails} />
        );
        sideSheet.handleOpen(true);
    };

    if (!bankDetails?.accountNumber) {
        transactionLink = (
            <NavElement
                size={NavElementSize.Small}
                type={NavElementType.Link}
                href={`/policies/${policy.planCode}/${policy.policyNumber}/policy/premiums/new-premium`}
            >
                {t('colDefs:policySummary.makePayment')}
            </NavElement>
        );
    } else {
        transactionLink = (
            <NavElement
                onClick={openBankingSidesheet}
                size={NavElementSize.Small}
                type={NavElementType.Button}
                className="text-left"
            >
                <PiiWrapper>
                    {t('colDefs:policySummary.endingIn', {
                        accountType: toTitleCase(bankDetails.accountType),
                        accountNumber:
                            formatAccountNumber(
                                bankDetails.internationalBankAccountNumber ??
                                    bankDetails.accountNumber,
                                true
                            ) ?? DEFAULT_ERROR_STRING,
                    })}
                </PiiWrapper>
            </NavElement>
        );
    }

    return (
        <>
            <Content details={amountAndDate} variant={ContentVariant.BodySm} />
            {transactionLink}
        </>
    );
};

const UpcomingPremiumDisplayField = ({ policy }: BasePolicyComponentArgs) => {
    const { t } = useTranslation([
        TranslationFiles.COMMON,
        TranslationFiles.COLDEFS,
    ]);
    const premiumProgram = policy.systematicPrograms.getProgramsByReason(
        Reason.PREMIUM
    );
    const translatedFrequency = t(
        `common:systematicProgram.frequency.${premiumProgram?.frequency?.toLowerCase()}`
    );

    return (
        <div>
            <Label
                variant={LabelVariant.FieldLabel}
                label={t('colDefs:policySummary.upcomingPremium', {
                    frequency: translatedFrequency,
                })}
            />
            <UpcomingPremium policy={policy} />
        </div>
    );
};

export default UpcomingPremiumDisplayField;
