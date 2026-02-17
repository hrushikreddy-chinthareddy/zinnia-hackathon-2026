import { merge } from 'lodash';
import { Jsonify } from 'type-fest';

import { IllustrationsClientCase } from '@deps/types/illustrations';

export const parseClientCase = (
    clientCase: Jsonify<IllustrationsClientCase>
): IllustrationsClientCase => {
    const { insuredDetails: { dateOfBirth } = {} } = clientCase;

    const parsedDate = dateOfBirth ? new Date(dateOfBirth) : undefined;

    return merge(clientCase, {
        insuredDetails: {
            dateOfBirth:
                parsedDate && !isNaN(parsedDate.getTime())
                    ? parsedDate
                    : undefined,
        },
    });
};
