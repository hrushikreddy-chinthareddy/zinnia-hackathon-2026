import { faker } from '@faker-js/faker';
import {
    Address,
    AddressType,
    State,
    Country,
} from '@zinnia/api-types/types/sor';

export const generateAddress = (): Address => {
    const addressType = faker.helpers.arrayElement(Object.values(AddressType));
    return {
        startDate: faker.date.past().toISOString().split('T')[0],
        endDate: faker.date.future().toISOString().split('T')[0],
        addressType: addressType,
        addressLine1: faker.location.streetAddress(),
        addressLine2: faker.datatype.boolean()
            ? faker.location.secondaryAddress()
            : '',
        addressLine3: '',
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }) as State,
        zipCode: faker.location.zipCode('#####'),
        zipCodeExtension: faker.number.int({ min: 1000, max: 9999 }).toString(),
        country: Country.US,
    };
};
