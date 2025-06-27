import { Meta } from '@storybook/react';

import { ExceptionInstance } from '@deps/models/case/exception-instance';

import ExceptionRow from './exception-row';

export default {
    title: 'Components/ExceptionRow',
    component: ExceptionRow,
    argTypes: {
        exceptions: {
            control: 'object',
        },
    },
    decorators: [(Story) => <div>{Story()}</div>],
} as Meta<typeof ExceptionRow>;

const exceptionsArray = [
    {
        id: '1',
        status: 'Not used in search page',
        category: 'Not used in search page',
        reason: "Address doesn't match what is on file.",
        detailedReason: "Address doesn't match what is on file.",
        additionalData: {},
        eventRef: [],
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '2',
        status: 'Not used in search page',
        category: 'Not used in search page',
        reason: "Address doesn't match what is on file.",
        detailedReason: "Address doesn't match what is on file.",
        additionalData: {},
        eventRef: [],
        updatedAt: new Date().toISOString(),
    },
    {
        id: '3',
        status: 'Not used in search page',
        category: 'Not used in search page',
        reason: "Address doesn't match what is on file.",
        detailedReason: "Address doesn't match what is on file.",
        additionalData: {},
        eventRef: [],
        updatedAt: new Date().toISOString(),
    },
];

export const SingleException = (args: { exceptions: ExceptionInstance[] }) => (
    <ExceptionRow {...args} />
);
SingleException.args = {
    exceptions: [exceptionsArray[1]],
};
export const MultipleExceptions = (args: {
    exceptions: ExceptionInstance[];
}) => <ExceptionRow {...args} />;
MultipleExceptions.args = {
    exceptions: exceptionsArray,
};
