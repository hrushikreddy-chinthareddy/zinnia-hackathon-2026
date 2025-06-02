import { faker } from '@faker-js/faker';
import { Phone, PhoneType } from '@zinnia/api-types/types/sor';

export const generatePhone = (): Phone => {
    const phoneType = faker.helpers.arrayElement(Object.values(PhoneType));
    return {
        startDate: faker.date.past().toISOString().split('T')[0],
        endDate: '',
        phoneType: phoneType,
        countryCode: '1',
        areaCode: faker.number.int({ min: 100, max: 999 }).toString(),
        dialNumber: faker.phone.number().toString(),
        extension: phoneType === PhoneType.BUSINESS ? faker.number.int({ min: 1000, max: 9999 }).toString() : '',
    };
};
