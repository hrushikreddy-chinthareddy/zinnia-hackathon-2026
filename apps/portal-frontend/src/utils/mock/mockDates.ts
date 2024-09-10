import { faker } from '@faker-js/faker';

export const generateKebabDate = () => {
    const year = faker.number.int({ min: 1900, max: 2023 });
    const month = faker.number.int({ min: 1, max: 12 });
    const day = faker.number.int({ min: 1, max: 28 });
    return `${year}-${month}-${day}`;
};
