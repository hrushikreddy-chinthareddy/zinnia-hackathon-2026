import { ColumnType } from '@deps/components/table-v2/table.types';
import { PartyRole } from '@zinnia/api-types/types/sor';

export const AllowedRoleTypes: string[] = [
    PartyRole.JOINTOWNER,
    PartyRole.OWNER,
    PartyRole.PAYEE,
    PartyRole.INSURED,
    PartyRole.JOINTANNUITANT,
    PartyRole.ANNUITANT,
];

export const AddressFieldsToMatchForRoleGroup = [
    'areaCode',
    'countryCode',
    'dialNumber',
    'addressType',
    'addressLine1',
    'addressLine2',
    'addressLine3',
    'city',
    'state',
    'zipCode',
];

export const PhoneFieldsToMatchForRoleGroup = [
    'areaCode',
    'countryCode',
    'dialNumber',
];

export const AssociatedAddressTableColumns = [
    {
        field: 'check',
        headerName: '',
        type: ColumnType.Boolean,
        width: '5%',
        editable: true,
    },
    { field: 'policyNumber', headerName: 'Contract #', type: ColumnType.Text },
    {
        field: 'partyRoleLabel',
        headerName: 'Role',
        editable: false,
        type: ColumnType.Text,
    },
    { field: 'address', headerName: 'Address', type: ColumnType.Text },
    { field: 'city', headerName: 'City', type: ColumnType.Text },
    { field: 'state', headerName: 'State', type: ColumnType.Text },
    { field: 'zip', headerName: 'Zip', type: ColumnType.Number },
];

export const custodialQualTypes = [
    'CUSTINHIRA',
    'CUSTINHROTHIRA',
    'CUSTROLLOVERIRA',
    'CUSTSAR/SEPIRA',
    'CUSTSIMPLEIRA',
    'CUSTSPOUSALIRA',
    'CUSTODIALIRA',
    'CUSTODIALIRA-SEP',
    'CUSTODIALQLACIRA',
    'CUSTODIALROTHIRA',
];

//TODO: remove mock response once API integrated
export const mockRolesContractTable: any = {
    data: {
        id: '657bddcddc353e5fc5f45acd',
        event: null,
        carrierId: 'SB',
        policyReferenceId: '563f35b74b904f87a2e3ddbde0c3c541',
        thirdPartyAdministratorId: 'tpa-12345',
        policy: [
            {
                policyNumber: '1',
                policyStatus: 'PENDINGISSUED',
                partyRoles: [
                    {
                        partyRoleId: '0|0|2',
                        partyRole: 'OWNER',
                        partyId: '900396750',
                        relationshipToInsured: 'TRUSTEE',
                        startDate: '2023-01-01',
                        endDate: '2023-01-01',
                    },
                ],
                parties: [
                    {
                        partyType: 'INDIVIDUAL',
                        fullName: 'Karen Anne Bates',
                        partyId: '900396750',
                        addresses: [
                            {
                                startDate: '2023-01-01',
                                endDate: '2023-01-01',
                                addressType: 'RESIDENCE',
                                addressLine1: '1112 Pickle Street',
                                addressLine2: 'South Jersey',
                                addressLine3: '1234 Post box',
                                city: 'Garden City',
                                state: 'AL',
                                zipCode: '67846',
                                zipCodeExtension: '23',
                                country: 'US',
                                addressId: '702023157',
                            },
                        ],
                    },
                ],
            },
            {
                policyNumber: '2',
                policyStatus: 'PENDINGISSUED',
                partyRoles: [
                    {
                        partyRoleId: '0|0|2',
                        partyRole: 'OWNER',
                        partyId: '900396750',
                        relationshipToInsured: 'TRUSTEE',
                        startDate: '2023-01-01',
                        endDate: '2023-01-01',
                    },
                ],
                parties: [
                    {
                        partyType: 'INDIVIDUAL',
                        fullName: 'Karen Anne Bates',
                        partyId: '900396750',
                        addresses: [
                            {
                                startDate: '2023-01-01',
                                endDate: '2023-01-01',
                                addressType: 'RESIDENCE',
                                addressLine1: '1112 Pickle Street',
                                addressLine2: 'South Jersey',
                                addressLine3: '1234 Post box',
                                city: 'Garden City',
                                state: 'AL',
                                zipCode: '67846',
                                zipCodeExtension: '23',
                                country: 'US',
                                addressId: '702023157',
                            },
                        ],
                    },
                ],
            },
        ],
    },
};
