export enum UserPermission {
    AllowReadCaseManagement = 'read_case',
    AllowReadPolicyAdmin = 'read_policy',
    AllowReadOtpRenewals = 'input_case',
    AllowEditPolicy = 'write_policy',
    AllowReadTasks = 'AllowReadTasks',
    AllowWriteClientCase = 'write_client_case',
    AllowWriteCasePriority = 'write_case_priority',
}

export interface PermissionsModel {
    [key: string]: [string];
}

export type UserProfile = {
    nickname: string;
    name: string;
    picture: string;
    updated_at: string;
    email: string;
    email_verified: boolean;
    sid: string;
    sub: string;
    partyId: string;
    user_metadata: {
        communication_mode: string;
    };
    app_metadata: {
        company: string;
    };
    [key: string]: unknown; // Any custom claim which could be in the profile
};
