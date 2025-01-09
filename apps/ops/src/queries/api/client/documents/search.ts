type v2ResultUniqueProperties = {
    attachmentType: string;
    caseId: string;
    clientID: string; // parentCarrierCode
    contractNumber: string; // policyNumber in v3
    docStatus: string;
    documentId?: string; // one or the other documentId or documentID will exist
    documentID?: string; // one or the other documentId or documentID will exist
    documentNumber: string;
    fileName: string;
    history: boolean;
    importDate: string;
    masterNumber: string; // brokerMasterNumber?
    pageCount: string;
    repMan: string; // repMasterNumber?
    sourceFileName: string;
    status: string;
};

type v3ResultUniqueProperties = {
    documentClassification: 'INBOUND' | 'OUTBOUND' | 'SERVICE_REQUEST_FORM' | 'TAX_FORMS'; // INBOUND = Policy, OUTBOUND = Correspondence for v2 source
    source: string;
    planCode: string;
    documentStatus: string;
    documentId: string;
    documentCategory: string;
    documentTypeDescription: string;
    appId: string;
    mailTrackingNumber: string;
    parentCarrierCode: string; // clientID in v2
    policyNumber: string; // contractNumber in v2
    createDate: string;
    correlationId: string;
    brokerMasterNumber: string;
    repMasterNumber: string;
};

type HomogenizedDocumentsResultProperties = {
    displayName: string;
    docPopUrl: string;
    documentDate: string;
    documentType: string;
    fileType: string;
    periodQuarter: string;
    periodYear: string;
    zinniaLiveCaseId: string;
};

type v2RequestUniqueProperties = {
    caseId?: string; // OnBaseCaseId, NOT zinniaLiveCaseId!!!
    clientCode?: string; // parentCarrierCode
    contractNumber?: string; // pollicyNumber
    docStatus?: string[]; // documentStatus in v3
    documentNumber?: string;
    importEndDate?: string;
    importStartDate?: string;
    masterNumber?: string;
    periods?: { PeriodYear: string; PeriodQuarters: ('Q1' | 'Q2' | 'Q3' | 'Q4')[] }[];
    recipient?: 'Agent' | 'Client';
    source: 'Policy' | 'Correspondence'; // documentClassification INBOUND | OUTBOUND for v3, respectively
};

type v3RequestUniqueProperties = {
    agentTaxId?: string;
    appId?: string;
    documentCategory?: 'NEW_BUSINESS' | 'POST_ISSUE' | 'DEATH' | 'CORRESPONDENCE' | 'TAX_FORMS';
    documentClassification?: 'INBOUND' | 'OUTBOUND' | 'SERVICE_REQUEST_FORM' | 'TAX_FORMS'; // source of Policy | Correspondence
    documentStatus?: ('ACTIVE' | 'INACTIVE')[]; // docStatus in v2
    orderBy?: string;
    orderByDirection?: 'ASC' | 'DESC';
    ownerSSN: string;
    parentCarrierCode?: string; // clientCode in v2
    periodQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    periodYear: number;
    planCode?: string;
    policyNumber?: string;
};

type HomogenizedRequestProperties = {
    documentDate?: string;
    documentEndDate?: string;
    documentStartDate?: string;
    documentType?: string;
    zinniaLiveCaseId?: string;
    limit?: number;
    offset?: number;
};

// BPB - toDos:
// see if we can get away with omitting the unmatched, unmapped values of v2
//  - caseId
//  - documentNumber
//  - importStartDate
//  - importEndDate
//  - masterNumber
//  - periods
//  - recipient
// Convert front-end pagination to backend pagination
// Figure out feature flagging

// builds up args to work with documents v2 search
// const buildV2SearchArgs = ({
//     searchBody,
//     limit = 10,
//     offset = 0,
// }: {
//     searchBody: SearchRequest;
//     limit?: number;
//     offset?: number;
// }): string => {
//     const args: DocumentApiRequestInputs = {
//         source: searchBody.documentClassification?.toLowerCase() === 'inbound' ? DocumentTypeView.Policy : DocumentTypeView.Correspondence,
//         clientCode: searchBody?.parentCarrierCode || '',
//         ...(searchBody?.policyNumber ? { contractNumber: searchBody?.policyNumber } : {}),
//         ...(searchBody?.zinniaLiveCaseId ? { contractNumber: searchBody?.zinniaLiveCaseId } : {}),
//         ...(searchBody?.documentStatus ? { docStatus: searchBody?.documentStatus?.join(',') } : {}),
//         ...(searchBody?.documentDate ? { contractNumber: searchBody?.documentDate } : {}),
//         ...(searchBody?.documentStartDate ? { contractNumber: searchBody?.documentStartDate } : {}),
//         ...(searchBody?.documentEndDate ? { contractNumber: searchBody?.documentEndDate } : {}),
//     };
//     getDocumentsV2();
//     return '';
// };

export const searchDocuments = async () => {
    /**
  use feature flag to determine which api to hit and how
  if (useV2) {
    searchFor
  }

  if (items) -> treat as v2 response
  if (documents) -> treat as v3 response
   */
};
