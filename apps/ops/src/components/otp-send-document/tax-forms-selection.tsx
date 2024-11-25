import 'react-pdf/dist/Page/TextLayer.css';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import Select from '@deps/components/select/select';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { Policy } from '@deps/models/policy/sor-policy';

import SendDocumentNavigationButtons from './action-components/navigation-buttons';
import { MultiselectOption } from '../autocomplete/autocomplete.types';
import TaxFormsListing from './components/tax-forms-listing';
import WorkflowCard from '../workflows/workflow-card/workflow-card';
export type StatementSelectionProps = {
    policy: Policy;
};
const TaxFormsSelection = ({ policy }: StatementSelectionProps) => {
    console.log('🚀 ~ TaxFormsSelection ~ policy:', policy);
    const { t } = useTranslation(undefined, { keyPrefix: 'contactCenter' });
    const currentYear = new Date().getFullYear();
    const taxYears = Array.from({ length: 5 }, (_, i) => currentYear - i).reverse();
    const { goToNext } = useWorkflow();

    const [selected, setSelected] = useState<{ [key: string]: string }>({});
    const handleContinue = async () => {
        goToNext();
    };

    const handleSelection = (selectedValue: string, displayText: string) => {
        setSelected(prev => {
            const newSelections = { ...prev };
            if (newSelections[selectedValue]) {
                delete newSelections[selectedValue];
            } else {
                newSelections[selectedValue] = displayText;
            }
            return newSelections;
        });
    };

    const taxYearOptions: MultiselectOption[] = taxYears.map(year => ({
        label: year.toString(),
        value: year.toString(),
        displayText: year.toString(),
    }));

    const taxForms = [
        {
            contractNumber: 'KA12317559',
            name: '1099-R',
            fChar: 'R',
            formId: '104',
            taxYear: '2019',
        },
        {
            contractNumber: 'KA12317559',
            name: '1099-R',
            fChar: 'R',
            formId: '105',
            taxYear: '2019',
        },
    ];
    const handleCancel = () => {};
    return (
        <WorkflowCard
            title={t(`sendTaxForms.tabs.taxFormsSelection`)}
            footerContent={<SendDocumentNavigationButtons handleContinue={handleContinue} handleCancel={handleCancel} />}
        >
            <div className="my-8 w-[214px] sm:w-[234px]">
                <Select
                    label={t('sendTaxForms.selectTaxYear') as string}
                    isMultiselect
                    options={taxYearOptions}
                    value={selected}
                    onChange={handleSelection}
                    placeholder={t('sendTaxForms.selectTaxYear') as string}
                />
            </div>
            <div>
                <TaxFormsListing taxForms={taxForms} />
            </div>
        </WorkflowCard>
    );
};

export default TaxFormsSelection;
