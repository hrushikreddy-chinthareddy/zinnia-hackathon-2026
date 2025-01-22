import 'react-pdf/dist/Page/TextLayer.css';
import { TaxformResponse } from '@zinnia/api-types/types/documents-v3';
import { AssistiveText, AssistiveTextVariant, Loader } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { SetStateAction, useEffect, useRef, useState } from 'react';

import Select from '@deps/components/select/select';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { TaxForm, TaxFormSelectionDetails } from '@deps/models/case/send-tax-forms';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { Policy } from '@deps/models/policy/sor-policy';
import { searchTaxForms } from '@deps/queries/api/tax-forms';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

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
    const { featureFlags } = useOptimizely();
    const abortControllerRef = useRef<Map<string, AbortController>>(new Map());

    const handleContinue = async () => {
        if (!taxFormSelectionDetails?.selectedTaxForms?.length) {
            return setError({ submit: t('sendTaxForms.errors.taxForms') as string });
        }
        goToNext();
    };

    useEffect(() => {
        Object.keys(selectedYears).forEach(year => {
            const newAbortController = new AbortController();
            getTaxForms(year, newAbortController);
        });
    }, []);

    const getTaxForms = async (selected: string, newAbortController: AbortController) => {
        try {
            setError({});
            setLoader(true);
            const requestData = {
                contractNumber: policy?.policyNumber || '',
                clientCode: policy?.carrierId || '',
                taxYear: Number(selected),
            };
            abortControllerRef.current.set(selected, newAbortController);

            const response = await searchTaxForms(requestData, featureFlags[FEATURE_FLAGS.DOCUMENTS_V3], newAbortController.signal);
            if (!response.items.length) {
                setError({ submit: t('sendTaxForms.errors.noTaxForms', { year: selected }) as string });
            }

            setTaxFormSelectionDetails(prev => {
                const existingTaxForms = prev?.taxForms || [];
                const newTaxForms = response?.items?.filter(
                    form => !existingTaxForms.find(existingForm => existingForm.taxYear === form.taxYear)
                );
                return {
                    ...prev,
                    taxForms: [...existingTaxForms, ...newTaxForms],
                };
            });
            setLoader(false);
        } catch (error) {
            setLoader(false);
            console.error('An error occurred while getting Tax Forms', error);
            return;
        }
    };

    const handleSelection = (selectedValue: string, displayText: string) => {
        const newSelections = { ...selectedYears };
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
            if (abortControllerRef?.current?.get(selectedValue)) {
                abortControllerRef.current.get(selectedValue)?.abort();
            }

            const newAbortController = new AbortController();

            getTaxForms(selectedValue, newAbortController);
            newSelections[selectedValue] = displayText;
        }
        setSelectedYears(newSelections);
    };

    const handleCancel = () => {
        setError({});
        setTaxFormSelectionDetails({
            taxForms: [],
            selectedTaxForms: [],
        });
    };

    const setSelectedTaxForms = (selectedTaxForms: TaxForm[] | TaxformResponse[]) => {
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
