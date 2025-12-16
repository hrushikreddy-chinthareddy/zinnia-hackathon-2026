export interface PolicyTimelineCardData {
    issueDate: string;
    fixedCostPeriod?: number;
    fixedCostPeriodLeft?: number;
    freeLookCancelDate?: string;
    maturityDate: string | null;
    policyAge: string;
    policyLength: string;
    policyYearsLeft: string | null;
    deliveryDate: string;
}
