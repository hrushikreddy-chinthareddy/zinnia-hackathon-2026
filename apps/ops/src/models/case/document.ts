export enum DocumentType {
    Exchange = 'Exchange',
    Oft = 'Outgoing Transfer',
    Redemption = 'Redemption',
    Rmd = 'Required Minimum Distribution',
    SSW = 'SYSTEMATIC',
    Reg60 = 'NB Reg 60',
    AddressChange = 'Address Change',
    ReReg = 'ReReg',
}

export enum DocumentFileExtension {
    Png = 'png',
    Tif = 'tif',
    Tiff = 'tiff',
}

export interface DocumentDownload {
    fileExtension: string;
    binaryData: string;
}

export interface DocumentDownloadWithMime extends DocumentDownload {
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
export const supportedImgExtensions = ['png', 'jpg', 'jpeg', 'jfif'];
export const supportedExtensions = ['pdf', 'adobe portable document', 'htm', 'html', ...supportedImgExtensions];
