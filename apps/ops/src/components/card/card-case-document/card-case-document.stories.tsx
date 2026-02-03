import '@deps/styles/styles.css';
import { Meta } from '@storybook/react';

import CardCaseDocument from '@deps/components/card/card-case-document/card-case-document';

export default {
    title: 'Components/Cards/CardCaseDocument',
    component: CardCaseDocument,
} as Meta<typeof CardCaseDocument>;

const caseDocumentOption = {
    documentNumber: '12345-AB-67890',
    tag: 'PAYMENT',
    value: 'case-12345',
};

export const Default = (args: any) => {
    return (
        <div className="flex max-w-[500px] flex-col">
            <CardCaseDocument
                caseDocumentOption={caseDocumentOption}
                index={0}
                {...args}
            />
        </div>
    );
};
