import { render } from '@testing-library/react';

import UserPhoneNumber from './phone-number';

describe('Phone Number component', () => {
    const phoneDetails = {
        personalInformation: {
            firstName: 'GREGORY',
            middleName: '',
            lastName: 'LARGE',
            phoneNumber: '',
            ssNumber: '',
            phoneExtension: '1234343',
            phoneType: {
                home: false,
                work: true,
                mobile: false,
            },
        },
        companyName: 'NEW YORK-BOOK 047',
        channel: 'CAS',
        addressDetails: {
            addressLine1: 'BR Road',
            addressLine2: '',
            addressLine3: '',
            city: 'New Town',
            state: 'NY',
            zipCode: '54678',
        },
    };

    const formConfig = {
        partyRoleType: 'OWNER',
        title: 'Owner Information',
        titleTooltip: 'Owner information is prefilled from OnBase keywords.',
        userFields: {
            fields: {
                firstName: {
                    fieldName: 'firstName',
                    fieldLabel: 'First name',
                },
                middleName: {
                    fieldName: 'middleName',
                    fieldLabel: 'Middle name',
                },
                lastName: {
                    fieldName: 'lastName',
                    fieldLabel: 'Last name',
                },
                userPhoneNumber: {
                    fieldName: 'phoneNumber',
                    fieldLabel: 'Owner phone number',
                },
                userSSN: {
                    fieldName: 'ssNumber',
                    fieldLabel: 'Owner SSN',
                },
                extension: {
                    fieldName: 'phoneExtension',
                    fieldLabel: 'Extension',
                },
                phoneType: {
                    home: {
                        fieldName: 'phoneType',
                        fieldLabel: 'Home',
                    },
                    work: {
                        fieldName: 'phoneType',
                        fieldLabel: 'Work',
                    },
                    mobile: {
                        fieldName: 'phoneType',
                        fieldLabel: 'Mobile',
                    },
                },
            },
        },
        addressFields: {
            fields: {
                streetAddress: {
                    fieldName: 'streetAddress',
                    fieldLabel: 'Owner street address',
                },
                streetAddress2: {
                    fieldName: 'streetAddress2',
                    fieldLabel: 'Street address 2',
                },
                streetAddress3: {
                    fieldName: 'streetAddress3',
                    fieldLabel: 'Street address 3',
                },
                city: {
                    fieldName: 'city',
                    fieldLabel: 'City',
                },
                state: {
                    fieldName: 'state',
                    fieldLabel: 'State',
                },
                zip: {
                    fieldName: 'zip',
                    fieldLabel: 'Zip',
                },
            },
        },
    };

    it('should render phone number field', () => {
        const { getByTestId } = render(
            <UserPhoneNumber
                phoneDetails={phoneDetails}
                onPhoneDetailsChange={jest.fn()}
                formConfig={formConfig as any}
                formErrors={{}}
                isFormStateReadOnly={false}
            />
        );
        expect(getByTestId('owner-phone-number')).toBeInTheDocument();
    });
});
