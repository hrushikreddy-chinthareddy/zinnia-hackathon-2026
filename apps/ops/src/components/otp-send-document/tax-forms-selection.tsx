import 'react-pdf/dist/Page/TextLayer.css';
import { AssistiveText, AssistiveTextVariant, Loader } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { SetStateAction, useState } from 'react';

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
};
const TaxFormsSelection = ({ policy, taxFormSelectionDetails, setTaxFormSelectionDetails, taxYearOptions }: StatementSelectionProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'contactCenter' });
    const [error, setError] = useState<FormValidationErrors>({});
    const [loader, setLoader] = useState(false);
    const { goToNext } = useWorkflow();

    const handleContinue = async () => {
        if (!taxFormSelectionDetails?.selectedTaxForms?.length) {
            return setError({ submit: t('sendTaxForms.errors.taxForms') as string });
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
            if (!response.items.length) {
                setError({ submit: t('sendTaxForms.errors.noTaxForms', { year: selected }) as string });
            }
            setTaxFormSelectionDetails(prev => ({
                ...prev,
                taxForms: [...(prev?.taxForms || []), ...response.items],
            }));

            setLoader(false);
        } catch (error) {
            setLoader(false);
            console.error('An error occurred while getting Tax Forms', error);
            return;
        }
    };

    const handleSelection = (selectedValue: string, displayText: string) => {
        const previousSelections = taxFormSelectionDetails?.selectedYears;
        let currentTaxForms = taxFormSelectionDetails?.taxForms;
        if (previousSelections[selectedValue]) {
            if (Array.isArray(currentTaxForms)) {
                currentTaxForms = currentTaxForms.filter(form => form.taxYear !== selectedValue);
            } else {
                currentTaxForms = [];
            }
            delete previousSelections[selectedValue];
            setTaxFormSelectionDetails(prev => ({
                ...prev,
                taxForms: currentTaxForms,
                selectedYears: previousSelections,
            }));
        } else {
            getTaxForms(selectedValue);
            previousSelections[selectedValue] = displayText;

            setTaxFormSelectionDetails(prev => ({
                ...prev,
                taxForms: currentTaxForms,
                selectedYears: previousSelections,
            }));
        }
    };

    const handleCancel = () => {
        setError({});
        setTaxFormSelectionDetails({
            taxForms: [],
            selectedTaxForms: [],
            selectedYears: {},
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
                    value={taxFormSelectionDetails?.selectedYears || {}}
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
