import 'react-pdf/dist/Page/TextLayer.css';
import { AssistiveText, AssistiveTextVariant, Loader } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { SetStateAction, useRef, useState } from 'react';

import Select from '@deps/components/select/select';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { TaxForm, TaxFormSelectionDetails } from '@deps/models/case/send-tax-forms';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { Policy } from '@deps/models/policy/sor-policy';
import { searchTaxForms } from '@deps/queries/api/tax-forms';

import SendDocumentNavigationButtons from './action-components/navigation-buttons';
import { MultiselectOption } from '../autocomplete/autocomplete.types';
import TaxFormsListing from './components/tax-forms-listing';
import WorkflowCard from '../workflows/workflow-card/workflow-card';
export type StatementSelectionProps = {
    policy: Policy;
    taxYearOptions?: MultiselectOption[];
    taxFormSelectionDetails: TaxFormSelectionDetails;
    setTaxFormSelectionDetails: (value: SetStateAction<TaxFormSelectionDetails>) => void;
    selectedYears: { [key: string]: string };
    setSelectedYears: (value: SetStateAction<{ [key: string]: string }>) => void;
};
const TaxFormsSelection = ({
    policy,
    taxFormSelectionDetails,
    setTaxFormSelectionDetails,
    taxYearOptions,
    selectedYears,
    setSelectedYears,
}: StatementSelectionProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'contactCenter' });
    const [error, setError] = useState<FormValidationErrors>({});
    const [loader, setLoader] = useState(false);
    const { goToNext } = useWorkflow();
    const abortControllerRef = useRef<AbortController | null>(null);

    const handleContinue = async () => {
        if (!taxFormSelectionDetails?.selectedTaxForms?.length) {
            return setError({ submit: t('sendTaxForms.errors.taxForms') as string });
        }
        goToNext();
    };

    const getTaxForms = async (selected: string, newAbortController: AbortController) => {
        try {
            setError({});
            setLoader(true);
            const requestData = {
                contractNumber: policy?.policyNumber || '',
                clientCode: policy?.carrierId || '',
                taxYear: Number(selected),
            };
            abortControllerRef.current = newAbortController;
            const response = await searchTaxForms(requestData, newAbortController.signal);
            if (!response.items.length) {
                setError({ submit: t('sendTaxForms.errors.noTaxForms', { year: selected }) as string });
            }

            setLoader(false);
            return response.items;
        } catch (error) {
            setLoader(false);
            console.error('An error occurred while getting Tax Forms', error);
            return [];
        }
    };

    const handleSelection = (selectedValue: string, displayText: string) => {
        setSelectedYears(prev => {
            const newSelections = { ...prev };
            let currentTaxForms = taxFormSelectionDetails?.taxForms;
            if (newSelections[selectedValue]) {
                delete newSelections[selectedValue];

                if (Array.isArray(currentTaxForms)) {
                    currentTaxForms = currentTaxForms.filter(form => form.taxYear !== selectedValue);
                } else {
                    currentTaxForms = [];
                }
                delete newSelections[selectedValue];
                setTaxFormSelectionDetails(prev => ({
                    ...prev,
                    taxForms: currentTaxForms,
                    selectedYears: newSelections,
                }));
            } else {
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
                const newAbortController = new AbortController();

                getTaxForms(selectedValue, newAbortController).then(taxForms => {
                    setTaxFormSelectionDetails(prev => ({
                        ...prev,
                        taxForms: [...(prev?.taxForms || []), ...taxForms],
                    }));
                });
                newSelections[selectedValue] = displayText;
            }
            return newSelections;
        });
    };

    const handleCancel = () => {
        setError({});
        setTaxFormSelectionDetails({
            taxForms: [],
            selectedTaxForms: [],
        });
    };

    const setSelectedTaxForms = (selectedTaxForms: TaxForm[]) => {
        setTaxFormSelectionDetails(prev => ({
            ...prev,
            selectedTaxForms: selectedTaxForms,
        }));
    };

    return (
        <WorkflowCard
            title={t(`sendTaxForms.tabs.taxFormsSelection`)}
            footerContent={<SendDocumentNavigationButtons handleContinue={handleContinue} handleCancel={handleCancel} />}
        >
            <div className="my-8 w-[214px] sm:w-[234px]">
                <Select
                    label={t('sendTaxForms.selectTaxYear') as string}
                    isMultiselect
                    options={taxYearOptions ?? []}
                    value={selectedYears || {}}
                    onChange={handleSelection}
                />
            </div>
            <div>
                {loader ? (
                    <Loader />
                ) : (
                    <>
                        {(taxFormSelectionDetails?.taxForms?.length > 0 || !Object.keys(error).length) && (
                            <TaxFormsListing
                                taxForms={taxFormSelectionDetails?.taxForms}
                                carrierCode={policy?.carrierId || ''}
                                selectedTaxForms={taxFormSelectionDetails.selectedTaxForms}
                                setSelectedTaxForms={setSelectedTaxForms}
                            />
                        )}
                    </>
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
