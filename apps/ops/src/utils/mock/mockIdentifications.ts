import { faker } from '@faker-js/faker';

import {
    Country,
    Identification,
    IdentificationType,
    State,
} from '@zinnia/api-types/types/sor';

export const generateIdentification = (): Identification => {
    const identificationType = faker.helpers.arrayElement(
        Object.values(IdentificationType)
    );
    return {
        identificationType: identificationType,
        identificationValue:
            identificationType === IdentificationType.SSN
                ? faker.number
                      .int({ min: 100000000, max: 999999999 })
                      .toString()
                : faker.number
                      .int({ min: 100000000, max: 9999999999 })
                      .toString(),
        issueState: faker.location.state({ abbreviated: true }) as State,
        issueCountry: Country.US,
    };
};
