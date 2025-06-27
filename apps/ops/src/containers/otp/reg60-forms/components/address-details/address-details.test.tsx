import { fireEvent, render, screen } from '@testing-library/react';

import AddressDetails from './address-details';

describe('AddressDetails', () => {
    const testUserInfo = {
        personalInformation: {
            firstName: 'GREGORY',
            middleName: 'JOHN',
            lastName: 'LARGErerer',
            phoneNumber: '12345',
            ssNumber: '7654321',
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
            addressLine1: 'Pune',
            addressLine2: 'Maharshtra',
            addressLine3: 'Street1',
            city: 'Pune',
            state: 'IN',
            zipCode: '12345',
        },
    };

    const formConfig = {
        addressType: 'AGENT_ADDRESS',
        title: '',
        fields: {
            streetAddress: {
                fieldName: 'streetAddress',
                fieldLabel: 'Agent/Broker street address',
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
    };

    it('Should render Address Component', () => {
        const handleChange = jest.fn();
        render(
            <AddressDetails
                isPayeeAddress={false}
                userData={testUserInfo}
                errors={{}}
                setUserData={handleChange}
                addressFieldConfig={formConfig}
            />
        );

        // Assert
        expect(screen.getByLabelText('City')).toBeInTheDocument();
        expect(screen.getByLabelText('Street address 2')).toBeInTheDocument();
        expect(
            screen.getByLabelText('Agent/Broker street address')
        ).toBeInTheDocument();
        expect(screen.getByLabelText('Street address 3')).toBeInTheDocument();
        expect(screen.getByLabelText('Zip')).toBeInTheDocument();
    });

    it('Should render Address Component and update address line 1', async () => {
        let addressInfo = { ...testUserInfo };
        const handleChange = (newUserInfo: any) => {
            addressInfo = newUserInfo;
        };
        render(
            <AddressDetails
                isPayeeAddress={false}
                userData={testUserInfo}
                errors={{}}
                setUserData={handleChange}
                addressFieldConfig={formConfig}
            />
        );
        const inputNode = screen.getByTestId('addressLine1');
        fireEvent.change(inputNode, { target: { value: 'new Address' } });
        handleChange({
            ...addressInfo,
            addressDetails: {
                ...addressInfo.addressDetails,
                addressLine1: 'new Address',
            },
        });
        expect(addressInfo.addressDetails.addressLine1).toBe('new Address');
    });

    it('Should render Address Component and update address line 2', async () => {
        let addressInfo = { ...testUserInfo };
        const handleChange = (newUserInfo: any) => {
            addressInfo = newUserInfo;
        };
        render(
            <AddressDetails
                isPayeeAddress={false}
                userData={testUserInfo}
                errors={{}}
                setUserData={handleChange}
                addressFieldConfig={formConfig}
            />
        );
        const inputNode = screen.getByTestId('addressLine2');
        fireEvent.change(inputNode, { target: { value: 'new Address 2' } });
        handleChange({
            ...addressInfo,
            addressDetails: {
                ...addressInfo.addressDetails,
                addressLine2: 'new Address 2',
            },
        });
        expect(addressInfo.addressDetails.addressLine2).toBe('new Address 2');
    });

    it('Should render Address Component and update address line 3', async () => {
        let addressInfo = { ...testUserInfo };
        const handleChange = (newUserInfo: any) => {
            addressInfo = newUserInfo;
        };
        render(
            <AddressDetails
                isPayeeAddress={false}
                userData={testUserInfo}
                errors={{}}
                setUserData={handleChange}
                addressFieldConfig={formConfig}
            />
        );
        const inputNode = screen.getByTestId('addressLine3');
        fireEvent.change(inputNode, { target: { value: 'new Address 3' } });
        handleChange({
            ...addressInfo,
            addressDetails: {
                ...addressInfo.addressDetails,
                addressLine3: 'new Address 3',
            },
        });
        expect(addressInfo.addressDetails.addressLine3).toBe('new Address 3');
    });

    it('Should render Address Component and update city', async () => {
        let addressInfo = { ...testUserInfo };
        const handleChange = (newUserInfo: any) => {
            addressInfo = newUserInfo;
        };
        render(
            <AddressDetails
                isPayeeAddress={false}
                userData={testUserInfo}
                errors={{}}
                setUserData={handleChange}
                addressFieldConfig={formConfig}
            />
        );
        const inputNode = screen.getByTestId('city');
        fireEvent.change(inputNode, { target: { value: 'new city' } });
        handleChange({
            ...addressInfo,
            addressDetails: { ...addressInfo.addressDetails, city: 'new city' },
        });
        expect(addressInfo.addressDetails.city).toBe('new city');
    });

    it('Should render Address Component and update zip', async () => {
        let addressInfo = { ...testUserInfo };
        const handleChange = (newUserInfo: any) => {
            addressInfo = newUserInfo;
        };
        render(
            <AddressDetails
                isPayeeAddress={false}
                userData={testUserInfo}
                errors={{}}
                setUserData={handleChange}
                addressFieldConfig={formConfig}
            />
        );
        const inputNode = screen.getByTestId('zipCode');
        fireEvent.change(inputNode, { target: { value: '09876' } });
        handleChange({
            ...addressInfo,
            addressDetails: { ...addressInfo.addressDetails, zipCode: '09876' },
        });
        expect(addressInfo.addressDetails.zipCode).toBe('09876');
    });
});
