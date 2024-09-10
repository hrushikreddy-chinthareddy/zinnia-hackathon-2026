import { DocumentData } from "@deps/models/case/document";
import { getDocument } from "@deps/queries/api/documents";
import { NotFoundError } from "@deps/types/errors";
import { Result, failure, success } from "@deps/types/result";

export const fetchDocument = async (documentNumber: string, docType: string, clientId: string): Promise<Result<Error, DocumentData>>  => {
    const document = await getDocument(documentNumber, docType, clientId);
    return document?.documentNumber ? success(document) : failure(new NotFoundError());
}
