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
/**
 * @deprecated Use standard Sidesheet from Bloom component library
 */
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import { policyDataToGlobalValues } from '@deps/helpers/global-values';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';
import { formatAccountNumber, toTitleCase } from '@deps/helpers/string.helpers';
import { DEFAULT_EXTENDED_DATE_FORMAT } from '@deps/types/constants';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import { SystematicProgram, Reason } from '@zinnia/api-types/types/sor';

const getAmountAndDate = (program?: SystematicProgram): string => {
    if (!program) {
        return DEFAULT_ERROR_STRING;
    }
    const amount = program?.amount;
    const paymentDate = program?.nextProgramDate;
    return `${numberFormatify(amount || '')} - ${
        dayjs(paymentDate).format(DEFAULT_EXTENDED_DATE_FORMAT) || ''
    }`;
};

const TransactionLink: React.FC<BasePolicyComponentArgs> = ({
    policy,
}: BasePolicyComponentArgs) => {
    const { t } = useTranslation([
        TranslationFiles.COMMON,
        TranslationFiles.COLDEFS,
    ]);
    const sideSheet = useSideSheetContextLegacy();

    const premiumProgram = policy.systematicPrograms.getProgramsByReason(
        Reason.PREMIUM
    );

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
        return null;
    }

    return (
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
};

const UpcomingPremiumDisplayField = ({ policy }: BasePolicyComponentArgs) => {
    const { t } = useTranslation([
        TranslationFiles.COMMON,
        TranslationFiles.COLDEFS,
    ]);
    const premiumProgram = policy.systematicPrograms.getProgramsByReason(
        Reason.PREMIUM
    );
    const translatedFrequency = premiumProgram?.frequency
        ? t(
              `common:systematicProgram.frequency.${premiumProgram?.frequency?.toLowerCase()}`
          )
        : '';

    return (
        <div>
            <Label
                variant={LabelVariant.FieldLabel}
                label={t('colDefs:policySummary.upcomingPremium', {
                    frequency: translatedFrequency,
                })}
            />
            <Content
                details={getAmountAndDate(premiumProgram)}
                variant={ContentVariant.BodySm}
            />
            <TransactionLink policy={policy} />
        </div>
    );
};

export default UpcomingPremiumDisplayField;
