import { fireEvent, render, screen } from '@testing-library/react';

import UserInformation from './user-information';

describe('UserInformation', () => {
    const formConfigs = {
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

    const personalInformation = {
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
            addressLine1: '',
            addressLine2: '',
            addressLine3: '',
            city: '',
            state: '',
            zipCode: '',
        },
    };

    it('Should render UserInformation component with default values', () => {
        const handleChange = jest.fn();
        render(<UserInformation userInfo={personalInformation} setUserInfo={handleChange} formErrors={{}} formConfig={formConfigs} />);
    });

    it('Should render UserInformation component and updated values from firstName field', () => {
        let userInfo = { ...personalInformation };

        const handleChange = (newUserInfo: any) => {
            userInfo = newUserInfo;
        };

        render(<UserInformation userInfo={userInfo} setUserInfo={handleChange} formErrors={{}} formConfig={formConfigs} />);
        const inputFirstName = screen.getByTestId(`firstName-${userInfo.personalInformation.firstName}`);
        fireEvent.change(inputFirstName, { target: { value: 'Virat' } });
        handleChange({ ...userInfo, personalInformation: { ...userInfo.personalInformation, firstName: 'Virat' } });
        expect(userInfo.personalInformation.firstName).toBe('Virat');
    });

    it('Should render UserInformation component and updated values from lastName field', () => {
        let userInfo = { ...personalInformation };

        const handleChange = (newUserInfo: any) => {
            userInfo = newUserInfo;
        };

        render(<UserInformation userInfo={userInfo} setUserInfo={handleChange} formErrors={{}} formConfig={formConfigs} />);
        const inputLastName = screen.getByTestId(`lastName-${userInfo.personalInformation.lastName}`);

        fireEvent.change(inputLastName, { target: { value: 'Kohli' } });

        handleChange({ ...userInfo, personalInformation: { ...userInfo.personalInformation, lastName: 'Kohli' } });
        expect(userInfo.personalInformation.lastName).toBe('Kohli');
    });

    it('Should render UserInformation component and updated values from middleName field', () => {
        let userInfo = { ...personalInformation };

        const handleChange = (newUserInfo: any) => {
            userInfo = newUserInfo;
        };

        render(<UserInformation userInfo={userInfo} setUserInfo={handleChange} formErrors={{}} formConfig={formConfigs} />);
        const input = screen.getByTestId(`middleName-${userInfo.personalInformation.middleName}`);

        fireEvent.change(input, { target: { value: 'na' } });

        handleChange({ ...userInfo, personalInformation: { ...userInfo.personalInformation, middleName: 'na' } });
        expect(userInfo.personalInformation.middleName).toBe('na');
    });

    it('Should render UserInformation component and updated values from ownerSSN field', () => {
        let userInfo = { ...personalInformation };

        const handleChange = (newUserInfo: any) => {
            userInfo = newUserInfo;
        };

        render(<UserInformation userInfo={userInfo} setUserInfo={handleChange} formErrors={{}} formConfig={formConfigs} />);

        const input = screen.getByTestId(`ownerSSN-${userInfo.personalInformation.ssNumber}`);

        fireEvent.change(input, { target: { value: '00018' } });

        handleChange({ ...userInfo, personalInformation: { ...userInfo.personalInformation, ssNumber: '00018' } });
        expect(userInfo.personalInformation.ssNumber).toBe('00018');
    });

    it('Should render UserInformation component and updated values from ownerPhoneNumber field', () => {
        let userInfo = { ...personalInformation };

        const handleChange = (newUserInfo: any) => {
            userInfo = newUserInfo;
        };

        render(<UserInformation userInfo={userInfo} setUserInfo={handleChange} formErrors={{}} formConfig={formConfigs} />);
        const input = screen.getByTestId('owner-phone-number');

        fireEvent.change(input, { target: { value: '12345678' } });

        handleChange({ ...userInfo, personalInformation: { ...userInfo.personalInformation, phoneNumber: '12345678' } });
        expect(userInfo.personalInformation.phoneNumber).toBe('12345678');
    });
});
