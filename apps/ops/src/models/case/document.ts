export enum DocumentType {
    Exchange = 'Exchange',
    Oft = 'Outgoing Transfer',
    Redemption = 'Redemption',
    Rmd = 'Required Minimum Distribution',
    SSW = 'SYSTEMATIC',
    Reg60 = 'NB Reg 60',
    AddressChange = 'Address Change',
    ReReg = 'ReReg',
    Suitability = 'Suitability',
    SuitabilityReview = 'SuitabilityReview',
}

export enum DocumentFileExtension {
    Png = 'png',
    Tif = 'tif',
    Tiff = 'tiff',
}

export interface DocumentDownloadV2 {
    fileExtension: string;
    binaryData: string;
}

export interface DocumentDownloadV2WithMime extends DocumentDownloadV2 {
    mimeType: string;
}

export interface DocumentBody {
    lob: string;
    docType: string;
    clientCode: string;
}

export interface DocumentData {
    agentEmailAddress: string | null;
    agentNumber: string;
    agentTaxId: string;
    agentMiddleName: string;
    agentPhoneNumber: string;
    firstName: string;
    lastName: string;
    middleName: string;
    phoneNumber: string;
    bdName: string;

    agentFirstName: string;
    agentLastName: string;
    batchId: string;
    businessUnit: string;
    caseId: string;
    clientInstitution: string;
    contract: string;
    contractValue?: string;
    contractStatusCode: string;
    dateReceived: string;
    distributionChannel: string;
    documentDate: string;
    documentNumber: string;
    documentTypeGroup: string;
    externalId: string;
    incomingFaxNumber: string | null;
    lob: string;
    onBaseDt: string;
    processCompanyCode: string;
    productCategory: string;
    productCompanyCode: string;
    productLine: string;
    productName: string;
    queueName: string;
    route: string;
    source: string;
    ssNTaxId: string;
    sysDocumentHandle: string;
    sysMailFromAddress: string;
    sysMailToAddress: string;
    system: string;
    transactionType: string;
    annuitantFirstName: string;
    annuitantLastName: string;
}

export interface DocumentResponse {
    data: DocumentData;
    count: number;
    limit: number;
    offset: number;
    total: number;
    status: number;
    message: string;
}

export type CaseDocument = {
    id: string;
    name: string;
    url: string;
    source: string;
    documentNumber?: string;
    documentUploadDate?: string;
    updatedAt: string;
    fileType: string;
};

export type EDSDocumentRequest = {
    pageCount: number;
    agentTaxId: string;
    lastName: string;
    brokerMAN: string;
    sourceFileName: string;
    scannerDocNumber: string;
    participantAccountNumber: string;
    documentNumber: string;
    agentLastName: string;
    emailFrom: string;
    shareSubPath: string;
    externalId: string;
    documentTypeDescription: string;
    bdExternalId: string;
    availabilityCode: string;
    sedDocumentSchemaType: string;
    documentDate: string;
    masterNumber: string;
    caseId: string;
    bdNumber: string;
    dataServicesUpdateDateTime: string;
    bdName: string;
    displayName: string;
    mtrackingNumber: string;
    emailSubject: string;
    payerId: string;
    startPage: string;
    trackingId: string;
    status: string;
    originalTextIndex: string;
    ssnOrTaxId: string;
    deliveryMethod: string;
    documentType: string;
    docPopUrl: string;
    planCode: string;
    fileType: string;
    documentId: string;
    agentFirstName: string;
    emailTo: string;
    mshipDate: string;
    clientCode: string;
    caseNumber: string;
    productName: string;
    source: string;
    firstName: string;
    appId: string;
    roles: string;
    attachmentType: string;
    repMan: string;
    zinniaLiveCaseId: string;
    distributionChannel: string;
    stockNumber: string;
};

export type EDSDocumentRequestBody = {
    sourceFileName: string;
    docAccessLevel: string;
    documentDate: string;
    docCategory: string;
    fileType: string;
    parentCarrierCode: string;
    documentType: string;
    docClassification: string;
    zinniaLiveCaseId: string;
    correlationId: string;
};

export type EDSDocumentResponse = {
    documentId: string;
    correlationId: string;
    message: string;
    success: boolean;
};

export interface DocumentErrorResponse {
    data: {
        err: string;
    };
    status: number;
    message: string;
}

export enum DocumentDisplayCode {
    Owner = 1,
    Producer = 2,
}
export interface PolicyDocument {
    caseId: string;
    contractNumber: string;
    displayName: string;
    documentDate: string;
    documentID?: string;
    documentId?: string; // added due to inconsistency in the Documents API when source=Policy
    docStatus: string;
    documentType: string;
    documentNumber: string;
    importDate: string;
    source: string;
    fileType: string;
    periodYear?: string;
    periodQuarter?: string;
    displayCode?: DocumentDisplayCode;
    documentName?: string;
}

export interface PolicyDocuments {
    count: number;
    items: PolicyDocument[];
}

export interface PolicyDocumentApiRequest {
    data: PolicyDocuments;
    status: number;
    statusText: string;
}

// tif and tiff are supported via a conversion to png at the nextjs server level.
export const supportedImgExtensions = ['png', 'jpg', 'jpeg', 'jfif', 'image/png', 'image/jpg', 'image/jpeg', 'image/jfif'];
export const supportedHtmlExtensions = ['html', 'htm', 'text/html', 'text/htm', 'file/html', 'file/htm', 'txt'];
export const supportedExtensions = [
    'pdf',
    'application/pdf',
    'adobe portable document',
    ...supportedHtmlExtensions,
    ...supportedImgExtensions,
];
