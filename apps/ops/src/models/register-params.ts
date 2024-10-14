export type RegisterParams = {
    email?: string;
    username?: string;
    password: string;
    access_token?: string;
    hasError: boolean;
    ErrorMessage: string;
    hasSuccessfulRegistration: boolean;
    customer_token: string;
};
