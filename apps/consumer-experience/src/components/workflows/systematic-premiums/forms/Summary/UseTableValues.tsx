
import { PartyRole, PaymentForm } from "@xd/api-types/dist/generated-types/bpm";
import { SystematicProgram } from "@xd/api-types/dist/generated-types/sor";
import { DEFAULT_DATE_FORMAT } from "@xd/utils/dist";
import dayjs from "dayjs";
import { useMemo } from "react";

import { useSystematicPremiums } from "@/components/providers/systematic-premiums/useSystematicPremiums";
import { PaymentMethod } from "@/types/payment";
import { PolicyParty } from "@/types/policy";
import { formatUSDollars } from "@/utils/currency";

import { TableValues } from "./SummaryForm.types";
export const useTableValues = ({
  payees,
  paymentMethods,
  systematicPremium,
}: {
  payees: PolicyParty[];
  paymentMethods: PaymentMethod[];
  systematicPremium?: SystematicProgram;
}) => {
  const { state } = useSystematicPremiums();
  return useMemo(() => {
    const result = {} as TableValues;

    const newBank = paymentMethods.find(
      paymentMethod =>
        paymentMethod.bankId === state.selectBankStep.bank?.bankId
    );

    // currently we can see paymentForm on systematicPremium.paymentForm
    // or systematicPremium.party.find(party => party.bankId === bankId).paymentForm
    // but both presuppose we have a systematicPremium to retrieve
    // which isn't the case for new autopay arrangements
    // so how do we get the paymentForm without relying on an existing systematicPremium?
    // https://se2llc-global.slack.com/archives/C069ZQ0REET/p1753984107283049?thread_ts=1753978579.055209&cid=C069ZQ0REET
    // one time premium requires paymentForm to successfully submit. Use accountType from the bank detail return
    const newPaymentForm = newBank?.accountType;

    const newPayor = payees.find(
      party => party.partyId === state.selectBankStep.payor?.payorPartyId
    );

    if (!newPayor || !newBank || !newPaymentForm) {
      return undefined;
    }

    result.newValues = {
      amount: formatUSDollars(state.systematicPremiumAmountStep.paymentAmount),
      frequency: state.systematicPremiumAmountStep.paymentFrequency,
      nextPaymentDate: dayjs(
        state.systematicPremiumAmountStep.effectiveDate
      ).format(DEFAULT_DATE_FORMAT),
      bank: newBank,
      paymentForm: newPaymentForm as PaymentForm,
      payor: newPayor,
    };

    if (!systematicPremium?.arrangementId) return result;

    const currentPayor = systematicPremium?.party?.find(
      party => party.partyRole === PartyRole.PAYOR
    );

    const currentPayorParty = payees.find(
      party => party.partyId === currentPayor?.partyId
    );

    const currentBank = paymentMethods.find(
      method => method.bankId === currentPayor?.bankId
    );

    const currentPaymentForm = systematicPremium?.party?.find(
      party => party.bankId === currentBank?.bankId
    )?.paymentForm;

    const currentFrequency = systematicPremium?.frequency;

    if (
      !currentFrequency ||
      !currentPaymentForm ||
      !currentBank ||
      !currentPayorParty ||
      !currentPayor
    ) {
      return result;
    }

    result.currentValues = {
      amount: formatUSDollars(systematicPremium.amount),
      frequency: currentFrequency,
      nextPaymentDate: dayjs(systematicPremium.nextProgramDate).format(
        DEFAULT_DATE_FORMAT
      ),
      bank: newBank,
      paymentForm: newPaymentForm as PaymentForm,
      payor: newPayor,
    };

    return result;
  }, [
    payees,
    paymentMethods,
    state.selectBankStep.bank?.bankId,
    state.selectBankStep.payor?.payorPartyId,
    state.systematicPremiumAmountStep.effectiveDate,
    state.systematicPremiumAmountStep.paymentAmount,
    state.systematicPremiumAmountStep.paymentFrequency,
    systematicPremium?.amount,
    systematicPremium?.arrangementId,
    systematicPremium?.frequency,
    systematicPremium?.nextProgramDate,
    systematicPremium?.party,
  ]);
};