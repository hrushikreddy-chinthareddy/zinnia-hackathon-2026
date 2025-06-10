type CarrierOrBrokerDealerName = string;
type ExceptionCategory = string;

export type MappedExceptionData = {
    totalCasesByCarrier: { [key: CarrierOrBrokerDealerName]: number };
    // Total Nigos Carrier
    total: { [key: CarrierOrBrokerDealerName]: number };
    // Daily Nigos Carrier
    daily: { [key: CarrierOrBrokerDealerName]: [number, number | null][] };
    weekly: { [key: CarrierOrBrokerDealerName]: number[] };
    // Monthly Nigos Carrier
    monthly: { [key: CarrierOrBrokerDealerName]: (number | null)[] };
    startMonth: number; // Index of the first month to be included in the chart
    startYear: number; // Year of the first date to be included in the chart
    carriers: CarrierOrBrokerDealerName[]; // List of carriers sorted by total cases, descending
    exceptionCategories: ExceptionCategory[]; // List of exception categories that came back
    totalMonths: number; // Number of months to be included in the chart
};

export enum ExceptionStatus {
    UNRESOLVED = 'Unresolved',
    NEW = 'New',
    IN_PROGRESS = 'In_Progress',
    INPROGRESS = 'Inprogress',
    RESOLVED = 'Resolved',
    OVERRRIDDEN = 'Overridden',
}
