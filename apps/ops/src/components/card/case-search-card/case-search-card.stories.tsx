import { Meta } from '@storybook/react';

import { PartyRole } from '@deps/helpers/parties';
import { Processes, Statuses } from '@deps/models/case/case';
import { ExceptionInstance } from '@deps/models/case/exception-instance';
import { PartyInstance } from '@deps/models/case/party-instance';
import '@deps/styles/styles.css';

import CaseSearchCard, { CaseSearchCardProps } from './case-search-card';

const meta: Meta<typeof CaseSearchCard> = {
    title: 'Components/Cards/CaseSearchCard',
    component: CaseSearchCard,
    args: {
        id: '4',
        carrier: 'EVERLY',
        caseStatus: Statuses.Completed,
        process: Processes.Withdrawal,
        searchValues: {},
    },
    argTypes: {
        carrier: {
            options: ['ULIC', 'GLCO', 'EVERLY', 'USAA', 'MASS', 'SBGC'],
            control: {
                type: 'select',
            },
        },
        processSubType: {
            control: 'text',
        },
        policyNumber: {
            control: 'text',
        },
        createdAt: {
            control: 'text',
        },
        updatedAt: {
            control: 'text',
        },
        caseStatus: {
            options: Statuses,
            control: {
                type: 'select',
            },
        },
        process: {
            options: Processes,
            control: {
                type: 'select',
            },
        },
    },
};

const completedArgs = {
    id: '1',
    carrier: 'EVERLY',
    caseStatus: Statuses.Completed,
    process:
        'Required Minimum Distribution Test Length Test Length Test Length',
    requestSubType:
        'A longer case sub type will go here test length test length',
    policyNumber: null,
    createdAt: '2023-06-07T05:20:44.000Z',
    updatedAt: '2023-10-07T05:20:44.000Z',
    parties: [
        {
            firstName: 'Claudia',
            lastName: 'Orkonstoviavish',
            partyRole: PartyRole.Owner,
        } as PartyInstance,
    ],
    searchValues: {
        ownerFirstName: 'Claudia',
    },
};

const exceptionArgs = {
    id: '2',
    carrier: 'sbgc',
    caseStatus: Statuses.Exception,
    process: Processes.NewBusiness,
    requestSubType: 'Incoming Transfer',
    parties: [
        {
            firstName: 'First',
            lastName: 'Orkonstoviavish',
            fullName: 'First Orkonstoviavish',
            partyRole: PartyRole.Owner,
        },
        {
            firstName: 'Second',
            lastName: 'Owner de la Policy',
            fullName: 'Second Owner de la Policy',
            partyRole: PartyRole.Owner,
        },
        {
            firstName: 'Third',
            lastName: 'Owner de la Policy',
            fullName: 'Second Owner de la Policy',
            partyRole: PartyRole.Owner,
        },
    ] as PartyInstance[],
    searchValues: {},
    exceptions: [
        {
            id: '123',
            status: 'NEW',
            category: 'DISBURSEMENT',
            reason: 'CHILD SUPPORT EXCEPTION',
            detailedReason: '',
            createdAt: '',
            updatedAt: '2023-10-07T05:20:44.000Z',
        },
    ] as ExceptionInstance[],
};

const notStartedArgs = {
    id: '3',
    carrier: 'mass',
    caseStatus: Statuses.NotStarted,
    process: Processes.Renewal,
    searchValues: {},
};

const canceledArgs = {
    id: '4',
    carrier: 'GLCO',
    caseStatus: Statuses.Canceled,
    process: Processes.Withdrawal,
    searchValues: {},
};

const inProgressArgs = {
    id: '4',
    carrier: 'USAA',
    caseStatus: Statuses.InProgress,
    process: Processes.NewBusiness,
    searchValues: {},
};

export const Default = (args: CaseSearchCardProps) => (
    <div className="w-full overflow-auto bg-gray-100 p-8">
        <CaseSearchCard {...completedArgs} />
        <CaseSearchCard {...exceptionArgs} />
        <CaseSearchCard {...canceledArgs} />
        <CaseSearchCard {...inProgressArgs} />
        <CaseSearchCard {...notStartedArgs} />
        <CaseSearchCard {...args} />
    </div>
);

export default meta;
