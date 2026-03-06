import * as ReactQuery from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import {
    ClaimActionTypes,
    RoleType,
} from '@deps/containers/death-claim-container/death-claim.types';
import {
    AddressType,
    Country,
    PartyRole,
    RelationshipToInsuredEnum,
} from '@zinnia/api-types/types/sor';

import { DeliveryMethods } from './bene-notification-tab/bene-notification-tab.types';
import DeathNotificationSidesheet from './death-notification';

jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

const useQuery = ReactQuery.useQuery as jest.Mock;
const commonSideSheetProps = {
    id: 'step-2',
    label: 'Step Label',
    type: 'stepType',
    dataType: 'string',
    value: '456',
    entityType: 'Entity1',
    source: 'Source1',
};

describe('##DeathNotificationSidesheet Component', () => {
    it('#should render loading state when isLoading is true', () => {
        useQuery.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        });
        render(
            <DeathNotificationSidesheet
                stepAdditionalData={commonSideSheetProps}
            />
        );
        expect(
            screen.getByText('deathNotification.loadingTransactions')
        ).toBeInTheDocument();
    });

    it('#should display error message when isError is true', () => {
        useQuery.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        });
        render(
            <DeathNotificationSidesheet
                stepAdditionalData={commonSideSheetProps}
            />
        );
        expect(
            screen.getByText('deathNotification.errorGettingTransactions')
        ).toBeInTheDocument();
    });

    it('#should display noData in case of no data', () => {
        useQuery.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        });
        render(
            <DeathNotificationSidesheet
                stepAdditionalData={commonSideSheetProps}
            />
        );
        expect(
            screen.getByText('deathNotification.noData')
        ).toBeInTheDocument();
    });

    it('#should  display formatted Notifier Details when Notifier data is available', () => {
        useQuery.mockReturnValue({
            data: {
                entity: {
                    carrierId: 'FLIC',
                    notifiers: {
                        dateOfNotification: '2024-01-01',
                        notifierRole: RoleType.Other,
                        party: {
                            fullName: 'Jane Notifier',
                            phone: { dialNumber: '1234567890' },
                            relationshipToInsured:
                                RelationshipToInsuredEnum.BROTHER,
                        },
                    },
                },
            },
            isLoading: false,
            isError: false,
        });

        render(
            <DeathNotificationSidesheet
                stepAdditionalData={commonSideSheetProps}
            />
        );
        expect(screen.getByText('deathNotification.title')).toBeInTheDocument();
        expect(
            screen.getByText('deathNotification.notifierDetails.title')
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                'deathNotification.notifierDetails.dateOfNotification'
            )
        ).toBeInTheDocument();
        expect(screen.getByText('01-01-2024')).toBeInTheDocument();

        expect(
            screen.getByText('deathNotification.notifierDetails.notifierRole')
        ).toBeInTheDocument();
        expect(screen.getByText('Other')).toBeInTheDocument();

        expect(
            screen.getByText('deathNotification.notifierDetails.notifierName')
        ).toBeInTheDocument();
        expect(screen.getByText('Jane Notifier')).toBeInTheDocument();

        expect(
            screen.getByText(
                'deathNotification.notifierDetails.notifierPhoneNumber'
            )
        ).toBeInTheDocument();
        expect(screen.getByText('(123) 456-7890')).toBeInTheDocument();

        expect(
            screen.getByText('deathNotification.notifierDetails.beneOnFileFlag')
        ).toBeInTheDocument();
        expect(
            screen.getByText('deathNotification.labels.no')
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                'deathNotification.notifierDetails.relationshipToInsured'
            )
        ).toBeInTheDocument();
        expect(screen.getByText('BROTHER')).toBeInTheDocument();
    });

    it('#should display formatted Deceased Details when Deceased data is available', () => {
        useQuery.mockReturnValue({
            data: {
                entity: {
                    carrierId: 'FLIC',
                    owners: [
                        {
                            party: {
                                fullName: 'Jane owner',
                                partyRole: PartyRole.OWNER,
                                relationshipToInsured:
                                    RelationshipToInsuredEnum.BROTHER,
                            },
                            isDeceased: true,
                            isDiedInForeignCountry: true,
                            dateOfDeath: '2025-06-10',
                        },
                        {
                            party: {
                                fullName: 'Non Deceased Owner',
                                partyRole: PartyRole.OWNER,
                                relationshipToInsured:
                                    RelationshipToInsuredEnum.BROTHER,
                            },
                            isDeceased: false,
                            isDiedInForeignCountry: true,
                            dateOfDeath: '2025-06-10',
                        },
                    ],
                },
            },
            isLoading: false,
            isError: false,
        });

        render(
            <DeathNotificationSidesheet
                stepAdditionalData={commonSideSheetProps}
            />
        );

        expect(screen.getByText('Jane Owner')).toBeInTheDocument();
        expect(screen.getByText('(Owner)')).toBeInTheDocument();

        expect(
            screen.queryByText('Non Deceased Owner')
        ).not.toBeInTheDocument();

        expect(
            screen.getByText('deathNotification.ownerDetails.foreignDeathFlag')
        ).toBeInTheDocument();
        expect(
            screen.getByText('deathNotification.labels.yes')
        ).toBeInTheDocument();

        expect(
            screen.getByText('deathNotification.ownerDetails.dateOfDeath')
        ).toBeInTheDocument();
        expect(screen.getByText('06-10-2025')).toBeInTheDocument();
    });

    it('#should display formatted Beneficiary Details when Beneficiary data is available', () => {
        useQuery.mockReturnValue({
            data: {
                entity: {
                    carrierId: 'FLIC',
                    beneficiaries: [
                        {
                            party: {
                                fullName: 'Email Beneficiary',
                            },
                            notificationPreferences: {
                                notificationMethod: {
                                    method: DeliveryMethods.Email,
                                },
                                email: {
                                    emailAddress: 'jane@example.com',
                                    action: ClaimActionTypes.ADD,
                                },
                            },
                        },
                        {
                            party: {
                                fullName: 'Fax Beneficiary',
                            },
                            notificationPreferences: {
                                notificationMethod: {
                                    method: DeliveryMethods.Faxnumber,
                                },
                                fax: {
                                    faxNumber: '7853681743',
                                    action: ClaimActionTypes.ADD,
                                },
                            },
                        },
                        {
                            party: {
                                fullName: 'Address Beneficiary',
                            },
                            notificationPreferences: {
                                notificationMethod: {
                                    method: DeliveryMethods.Mail,
                                },
                                address: {
                                    addressType: AddressType.RESIDENCE,
                                    addressLine1: 'ONE SECURITY BENEFIT PLACE',
                                    country: Country.US,
                                    action: ClaimActionTypes.ADD,
                                },
                            },
                        },
                    ],
                },
            },
            isLoading: false,
            isError: false,
        });

        render(
            <DeathNotificationSidesheet
                stepAdditionalData={commonSideSheetProps}
            />
        );

        expect(screen.getByText('Email Beneficiary')).toBeInTheDocument();
        expect(
            screen.getByText('deathNotification.beneficiaryDetails.email')
        ).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();

        expect(screen.getByText('Fax Beneficiary')).toBeInTheDocument();
        expect(
            screen.getByText('deathNotification.beneficiaryDetails.faxnumber')
        ).toBeInTheDocument();
        expect(screen.getByText('(785) 368-1743')).toBeInTheDocument();

        expect(screen.getByText('Address Beneficiary')).toBeInTheDocument();
        expect(
            screen.getByText('deathNotification.beneficiaryDetails.mail')
        ).toBeInTheDocument();
        expect(
            screen.getByText('One Security Benefit Place')
        ).toBeInTheDocument();
        expect(screen.getByText('US')).toBeInTheDocument();
    });

    it('#should not render Beneficiary Details when notification validation fails', () => {
        useQuery.mockReturnValue({
            data: {
                entity: {
                    carrierId: 'FLIC',
                    beneficiaries: [
                        {
                            party: {
                                fullName: 'Email Beneficiary',
                            },
                            notificationPreferences: {
                                notificationMethod: {
                                    method: DeliveryMethods.Email,
                                },
                                email: {
                                    emailAddress: 'jane@example.com',
                                    action: ClaimActionTypes.NONE,
                                },
                            },
                        },
                    ],
                },
            },
            isLoading: false,
            isError: false,
        });

        render(
            <DeathNotificationSidesheet
                stepAdditionalData={commonSideSheetProps}
            />
        );

        expect(
            screen.getByText('deathNotification.beneficiaryDetails.title')
        ).toBeInTheDocument();
        expect(
            screen.getByText('deathNotification.beneficiaryDetails.noData')
        ).toBeInTheDocument();
    });
});
