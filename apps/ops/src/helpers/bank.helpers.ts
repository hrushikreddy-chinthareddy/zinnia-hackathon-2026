import { LifeCadBanking, LifeCadParty } from '@deps/models/case/lifecad-party';
import { LifeCadPartyRoles } from '@deps/models/case/withdrawal/case';
import { PartyRoleId } from '@deps/types/constants';
import {
    BankAccount,
    Parties,
    PartyRole,
    PolicyPartyRoles,
} from '@zinnia/api-types/types/sor';

export const getBankingDetailsLC = (parties: LifeCadParty[]) => {
    const party = parties?.find(
        (party: LifeCadParty) => party.Role === LifeCadPartyRoles.PrimaryOwner
    );
    return party?.Banking || [];
};

export const isExistingBankLC = (
    bankingDetails: LifeCadBanking[],
    bankName: string
): boolean => {
    return bankingDetails.map((bank) => bank.BankName).includes(bankName || '');
};

export const getBankingDetails = (parties: LifeCadParty[]) => {
    const party = parties?.find(
        (party) => party?.partyRoleId === PartyRoleId.OwnerRoleId
    );
    return party?.bankDetails || [];
};

export const isExistingBank = (
    bankingDetails: BankAccount[],
    bankName: string
): boolean => {
    return bankingDetails
        .map((bank) => bank.branchName)
        .includes(bankName || '');
};

export const getBankOptionsLC = (bankingDetails: LifeCadBanking[]) => {
    return bankingDetails.map((bank) => ({
        label: bank.BankName as string,
        value: String(bank.BankId),
    }));
};

export const getBankOptions = (bankingDetails: BankAccount[]) => {
    return bankingDetails.map((bank) => ({
        label: bank.branchName as string,
        value: String(bank.bankId),
    }));
};

export const getSelectedOptionLC = (
    bankingDetails: LifeCadBanking[],
    selectedBank: string
) => {
    return bankingDetails.find(
        (bankDetail) => String(bankDetail?.BankId) === selectedBank
    );
};

export const getSelectedOption = (
    bankingDetails: BankAccount[],
    selectedBank: string
) => {
    return bankingDetails.find(
        (bankDetail) => String(bankDetail.bankId) === selectedBank
    );
};

export const isIrrevocableBeneficiaryExistsLC = (parties: LifeCadParty[]) => {
    return !!parties?.find(
        (party) => party.Role === LifeCadPartyRoles.Beneficiary
    );
};

export const isIrrevocableBeneficiaryExists = (
    parties: Parties[],
    partyRoles: PolicyPartyRoles[]
) => {
    const bene = partyRoles?.find(
        (pr) => pr.partyRole === PartyRole.PRIMARYBENEFICIARY
    );
    return !!parties?.find((party) => party.partyId === bene?.partyId);
};
