import { PaymentMethod } from '@deps/models/case/withdrawal/case';

export interface BankInFile {
    BankId: number;
    BankName: string;
    RoutingNumber: string;
    AccountNumber: string;
    AccountType: 'Checking' | 'Savings';
    Purpose: string;
    PaymentMethod: PaymentMethod | '';
    BankStartDate: string;
    BankEndDate: string;
    ListBillId: number;
    EFTCode: string;
    EFTStatus: 'Active' | 'Inactive';
}

export interface BankingDetails {
    isBankSelected: boolean;
    bankingInFile: BankInFile[] | null | [];
    selectedBanking: SelectedBanking | '';
    paymentMethod: PaymentMethod | '';
}

export enum SelectedBanking {
    OnFile = 'onFile',
    New = 'new',
}
