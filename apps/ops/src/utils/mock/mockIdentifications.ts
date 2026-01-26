import { faker } from '@faker-js/faker';

import { Identification } from '@zinnia/api-types/types/sor';

export const generateIdentification = (): Identification => {
    const identificationType = faker.helpers.arrayElement(
        Object.values(Identification.identificationType)
    );
    return {
        identificationType: identificationType,
        identificationValue:
            identificationType === Identification.identificationType.SSN
                ? faker.number
                      .int({ min: 100000000, max: 999999999 })
                      .toString()
                : faker.number
                      .int({ min: 100000000, max: 9999999999 })
                      .toString(),
        // FIXME: issueState/issueCountry now use nested Identification enums
        issueState: faker.location.state({
            abbreviated: true,
        }) as Identification.issueState,
        issueCountry: Identification.issueCountry.US,
    };
};
