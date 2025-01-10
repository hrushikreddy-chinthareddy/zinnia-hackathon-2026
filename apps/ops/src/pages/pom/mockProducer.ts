import { GetProducerResponse, ProducerType, PhoneType } from './types';

export function fetchProducer(): { data: GetProducerResponse } {
    return {
        data: {
            producerType: ProducerType.Corporation,
            fullName: 'John Smith Doe',
            caseId: '1234567890',
            taxId: '1234567890',
            socialSecurityNumber: '1234567890',
            taxPayerIdentificationNumber: '1234567890',
            nationalProducerNumber: '1234567890',
            email: 'john.smith.doe@example.com',
            phoneNumbers: [
                {
                    countryCode: '1',
                    number: '1234567890',
                    extension: '1234567890',
                    type: PhoneType.Primary,
                },
            ],
            addresses: [
                {
                    line: '1234 Main St',
                    line2: 'Apt 1',
                    city: 'Anytown',
                    state: 'CA',
                    country: 'USA',
                    zipCode: '1234567890',
                    effectiveDates: {
                        startDate: '2020-01-01',
                        endDate: '2020-01-01',
                        isCurrent: true,
                    },
                },
            ],
        },
    };
}
