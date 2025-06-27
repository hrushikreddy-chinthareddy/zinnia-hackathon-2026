import { faker } from '@faker-js/faker';

export type Comment = {
    userName: string;
    comment: string;
    submissionDate: string;
};

export const generateComments = (x: number) =>
    Array(x)
        .fill(x)
        .map(
            (): Comment => ({
                userName: faker.string.uuid(),
                comment: faker.lorem.word(),
                submissionDate: faker.date.past().toISOString().split('T')[0],
            })
        );
