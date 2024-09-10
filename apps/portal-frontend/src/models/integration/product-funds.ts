export type ProductFund = {
    clientCode: string;
    divisionCode: string;
    expiryDate: string;
    fundCode: string;
    fundName: string;
    productCode: string;
    productFundId: string;
    sourceSystem: string;
};

export type ProductFundsRequestBody = {
    clientCode: string;
    expiryDate?: string; // This are not optional for the request body, but existing request all use 2999 as the year, so meh.
    planCode: string;
    sourceSystem?: string; // This is not optional for the request body, but existing requests are all using LC as the system, so meh.
};
