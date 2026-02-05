import { faker } from '@faker-js/faker';

import {
    Identification,
    IdentificationTypeEnum,
} from '@zinnia/api-types/types/sor';

export const generateIdentification = (): Identification => {
    const identificationType = faker.helpers.arrayElement(
        Object.values(IdentificationTypeEnum)
    );
    return {
        identificationType: identificationType,
        identificationValue:
            identificationType === IdentificationTypeEnum.SSN
                ? faker.number
                      .int({ min: 100000000, max: 999999999 })
                      .toString()
                : faker.number
                      .int({ min: 100000000, max: 9999999999 })
                      .toString(),
        // FIXME: issueState/issueCountry now use nested Identification enums
        // FIXME: issueState/issueCountry now use State/Country enums
        issueState: faker.location.state({
            abbreviated: true,
        }) as Identification['issueState'],
        issueCountry: 'US' as Identification['issueCountry'],
    };
};
