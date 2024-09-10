import { Meta } from '@storybook/react';

import { Processes } from '@deps/models/case/case';
import '@deps/styles/styles.css';

import CaseType, { CaseTypeProps } from './case-type';

export default {
    title: 'Components/CaseType',
    component: CaseType,
    decorators: [
        Story => (
            <div className="h-screen w-screen p-10">
                <div
                    style={{
                        width: '200px',
                    }}
                >
                    <Story />
                </div>
            </div>
        ),
    ],
    argTypes: {
        caseType: {
            control: 'select',
            options: Object.values(Processes),
        },
        createdAt: {
            control: 'date',
        },
        variant: {
            control: 'radio',
            options: ['table-column', 'horizontal'],
        },
    },
} as Meta<typeof CaseType>;

export const NewBusinessTableColumn = (args: CaseTypeProps) => <CaseType {...args} />;
NewBusinessTableColumn.args = {
    caseType: Processes.NewBusiness,
    createdAt: new Date().toISOString(),
    variant: 'table-column',
};

export const CorrespondenceTableColumn = (args: CaseTypeProps) => <CaseType {...args} />;
CorrespondenceTableColumn.args = {
    caseType: Processes.Correspondence,
    createdAt: new Date().toISOString(),
    variant: 'table-column',
};

export const RedemptionTableColumn = (args: CaseTypeProps) => <CaseType {...args} />;
RedemptionTableColumn.args = {
    caseType: Processes.Redemption,
    createdAt: new Date().toISOString(),
    variant: 'table-column',
};
export const FakeCaseTypeTableColumn = (args: CaseTypeProps) => <CaseType {...args} />;
FakeCaseTypeTableColumn.args = {
    caseType: 'Fake Case Type',
    createdAt: new Date().toISOString(),
    variant: 'table-column',
};

export const NewBusinessHorizontal = (args: CaseTypeProps) => <CaseType {...args} />;
NewBusinessHorizontal.args = {
    caseType: Processes.NewBusiness,
    variant: 'horizontal',
};

export const RedemptionHorizontal = (args: CaseTypeProps) => <CaseType {...args} />;
RedemptionHorizontal.args = {
    caseType: Processes.Redemption,
    variant: 'horizontal',
};

export const CorrespondenceHorizontal = (args: CaseTypeProps) => <CaseType {...args} />;
CorrespondenceHorizontal.args = {
    caseType: Processes.Correspondence,
    variant: 'horizontal',
};
