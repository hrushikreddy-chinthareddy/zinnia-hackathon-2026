import { faker } from '@faker-js/faker';
import { Email, EmailType } from '@zinnia/api-types/types/sor';

export const generateEmail = (): Email => {
    return {
        startDate: faker.date.past().toISOString().split('T')[0],
        endDate: '',
        emailType: faker.helpers.arrayElement(Object.values(EmailType)),
        emailAddress: faker.internet.email(),
    };
};
