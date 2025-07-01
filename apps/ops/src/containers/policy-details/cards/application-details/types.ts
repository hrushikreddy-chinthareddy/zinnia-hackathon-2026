export interface ApplicationDetailsCardData {
    issueState: string;
    salesChannel: string;
    originalPolicyNumber: string;
    applicationSource: string;
    applicationSourceDetails: string;
    multiPolicyDiscount: string | null; // DEPU-5046 - only show if feature exists
}
