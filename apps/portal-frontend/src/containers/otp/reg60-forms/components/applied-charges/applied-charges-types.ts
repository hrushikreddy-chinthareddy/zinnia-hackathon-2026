export interface AppliedChargesProps {
    checkboxLabel: string;
    textInputLabel: string;
    isChecked?: boolean;
    amountValue?: number | string;
    onDataChange: (data: ApplyChargesType) => void;
    className?: string | undefined;
    required?: boolean;
    formError?: string;
    isFormStateReadOnly?: boolean;
}

export type ApplyChargesType = {
    applicable: boolean;
    amount?: string | number;
};
