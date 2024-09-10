import { CaseType, CreateCaseBody, CreateCaseResponse } from "@deps/models/case/case";
import { createCase } from "@deps/queries/api/cases";
import { CreateCaseError } from "@deps/types/errors";
import { Result, failure, success } from "@deps/types/result";

const createCaseFromDocumentNumber = async (
    documentNumber: string,
    caseId: string,
    contract: string,
    process: CaseType,
    clientId: string
): Promise<Result<Error, CreateCaseResponse>>  => {
    const query: CreateCaseBody = {
        carrier: clientId.toUpperCase(),
        process,
        identifiers: [
            {
                identifier: 'documentNumber',
                value: documentNumber,
            },
            {
                identifier: 'contractNumber',
                value: contract,
            },
            {
                identifier: 'caseID',
                value: caseId,
            },
        ],
    };
    const data = await createCase(query);
    return data?.id ? success(data) : failure(new CreateCaseError());
};

export default createCaseFromDocumentNumber;