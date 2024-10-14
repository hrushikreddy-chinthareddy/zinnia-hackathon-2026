import { faker } from '@faker-js/faker';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { PolicyExtrasTest } from '@deps/jest/constants/test-id-constants';

/**
 * Generates an array of React elements representing fields for PolicyExtrasCard.
 * Each field consists of a label and content, with content populated using faker.
 *
 * @function
 * @param {number} [fieldsNum=12] - The number of fields to generate.
 * @param {boolean} [rainbow=false] - Rainbow background for visual testing
 * @returns {ReactElement[]} An array of React elements representing fields.
 */

export const generateFields = (fieldsNum = 12, rainbow = false): JSX.Element[] =>
    Array.from({ length: fieldsNum }).map((_, index) => (
        <span
            style={{
                backgroundColor: rainbow ? `hsl(${faker.number.int(360)} 30% 80%)` : undefined,
            }}
            data-testid={PolicyExtrasTest.FIELD}
            key={index}
        >
            <Label variant={LabelVariant.FieldLabel} label={faker.lorem.word()} />
            <Content variant={ContentVariant.BodySm} details={faker.lorem.words()} />
        </span>
    ));
