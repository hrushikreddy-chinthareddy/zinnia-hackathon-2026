import 'react-pdf/dist/Page/TextLayer.css';
import { AssistiveText, AssistiveTextVariant, Loader } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { SetStateAction, useState } from 'react';

import Select from '@deps/components/select/select';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { TaxForm } from '@deps/models/case/send-tax-forms';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { Policy } from '@deps/models/policy/sor-policy';
import { searchTaxForms } from '@deps/queries/api/tax-forms';

import SendDocumentNavigationButtons from './action-components/navigation-buttons';
import { MultiselectOption } from '../autocomplete/autocomplete.types';
import TaxFormsListing from './components/tax-forms-listing';
import WorkflowCard from '../workflows/workflow-card/workflow-card';
export type StatementSelectionProps = {
    policy: Policy;
    selectedTaxForms: TaxForm[];
    setSelectedTaxForms: (value: SetStateAction<TaxForm[]>) => void;
};
const TaxFormsSelection = ({ policy, selectedTaxForms, setSelectedTaxForms }: StatementSelectionProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'contactCenter' });
    const currentYear = new Date().getFullYear();
    const taxYears = Array.from({ length: 5 }, (_, i) => currentYear - i).reverse();
    const [error, setError] = useState<FormValidationErrors>({});
    const [loader, setLoader] = useState(false);
    const [taxForms, setTaxForms] = useState<TaxForm[]>([]);
    const { goToNext } = useWorkflow();

    const [selected, setSelected] = useState<{ [key: string]: string }>({});
    const handleContinue = async () => {
        if (!selectedTaxForms.length) {
            return setError({ submit: t('errors.taxForms') as string });
        }
        goToNext();
    };

    const getTaxForms = async (selected: string) => {
        try {
            setError({});
            setLoader(true);
            const requestData = {
                contractNumber: policy?.policyNumber || '',
                clientCode: policy?.carrierId || '',
                taxYear: Number(selected),
            };

            const response = await searchTaxForms(requestData);
            setTaxForms(prev => [...prev, ...response.items]);
            setError({ submit: t('errors.noTaxForms', { year: selected }) as string });
            setLoader(false);
        } catch (error) {
            setLoader(false);
            console.error('An error occurred while getting Tax Forms', error);
            return;
        }
    };

    const handleSelection = (selectedValue: string, displayText: string) => {
        setSelected(prev => {
            const previousSelections = { ...prev };
            if (previousSelections[selectedValue]) {
                setTaxForms(prevTaxForms => {
                    if (Array.isArray(prevTaxForms)) {
                        return prevTaxForms.filter(form => form.taxYear !== selectedValue);
                    } else {
                        return [];
                    }
                });

                delete previousSelections[selectedValue];
            } else {
                getTaxForms(selectedValue);
                previousSelections[selectedValue] = displayText;
            }
            return previousSelections;
        });
    };

    const taxYearOptions: MultiselectOption[] = taxYears.map(year => ({
        label: year.toString(),
        value: year.toString(),
        displayText: year.toString(),
    }));

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
                {loader ? (
                    <Loader />
                ) : (
                    <TaxFormsListing
                        taxForms={taxForms}
                        carrierCode={policy?.carrierId || ''}
                        selectedTaxForms={selectedTaxForms}
                        setSelectedTaxForms={setSelectedTaxForms}
                    />
                )}
            </div>

            {error && (
                <div className="flex flex-col mt-2">
                    {error.submit && <AssistiveText text={error?.submit} variant={AssistiveTextVariant.Error} />}
                </div>
            )}
        </WorkflowCard>
    );
};

export default TaxFormsSelection;
