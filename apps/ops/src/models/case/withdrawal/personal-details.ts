export interface PersonalDetailsType {
    partyRoleType: string; //- lifecad party API
    firstName: string;
    middleName: string;
    lastName: string;
    fullName: string;
    suffix: string | '';
    dob: string | null;
    taxID: string | null;
    email: string | null;
    employer: string | null;
    maritalStatus: {
        text: string;
    };
}
