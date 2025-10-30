//TODO: Replace these when the actual API is complete.
export type WithdrawalTransaction = {
  _id: string;
  correlationId: string;
  transactionType: string;
  carrier: string;
  source: string;
  entityType: string;
  entity: {
    recordId: string;
    recordType: string;
    status: string;
    withdrawalTransaction: {
      transactionId: string;
      policyHolder: {
        name: string;
        primaryId: string;
      };
      agent: {
        name: string;
        primaryId: string;
      };
      withdrawalSummary: {
        withdrawalType: string;
        withdrawalMethod: string;
        withdrawalSubmittedDate: string;
        withdrawalExpireDate: string;
        effectiveDate: string;
        requestedAmount: number;
        withdrawalCharge: number;
        totalPayment: number;
      };
      authorization: {
        deepLink: string;
        emailExpirationDate: string;
        authorizationStatus: string;
      };
      contactSnapshot: {
        email: string;
        mobile: string;
      };
      taxes: Array<{
        federalTax: string;
        stateTax: string;
      }>;
      payee: Array<{
        paymentAmountType: string;
        requestedWithdrawalAmount: number;
        withdrawalCharge: number;
        totalPayment: number;
      }>;
      paymentMethod: Array<{
        paymentMode: string;
        bankingDetails: Array<{
          bankName: string;
          accountNumber: string;
        }>;
      }>;
    };
  };
  identifiers: {
    identifier: string;
    value: string;
  }[];
};

export type WithdrawalTransactions = Array<WithdrawalTransaction>;
