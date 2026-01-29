import {
    Parties,
    PolicyCoverage,
    SystematicProgram,
} from '@zinnia/api-types/types/sor';

// This returns the bank details for the party related to the current systematic program payment.
// TODO: right now we assume the first index of the party array in the systematic program object is the only one (100% payment to one party) as that's all the UI supports.  This will probably change later!
export const getBankDetails = (
    party: Parties | undefined,
    systematicProgram: SystematicProgram | undefined
) =>
    party?.bankDetails?.find(
        (bank) => bank.bankId === systematicProgram?.parties?.[0]?.bankId
    );

export const getFlatExtra = (coverage: PolicyCoverage | undefined) =>
    coverage?.coverageLayers?.[0]?.coverageParticipants?.[0]?.flatExtra || [];

// This returns the party details for the party related to the current systematic program payment.
// TODO: right now we assume the first index of the party array in the systematic program object is the only one (100% payment to one party) as that's all the UI supports.  This will probably change later!
export const getParty = (
    parties: Parties[] | undefined,
    systematicProgram: SystematicProgram | undefined
) =>
    parties?.find(
        (party) => party.partyId === systematicProgram?.parties?.[0]?.partyId
    );
