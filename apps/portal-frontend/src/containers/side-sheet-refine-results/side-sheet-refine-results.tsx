import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import Button, { ButtonType } from '@deps/components/button/button';
import { FieldSize } from '@deps/components/fields/field';
import NavElement, { NavElementType } from '@deps/components/nav-element/nav-element';
import Select from '@deps/components/select/select';
import Toggle from '@deps/components/toggle/toggle';
import { CaseSearchAdditionalFilters, CaseSearchFilters, initialAdditionalFilters } from '@deps/contexts/CaseManagementFilters';
import { ReferenceDataQuery, getReferenceData } from '@deps/queries/api/cases';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';
import { getCarrierListItem, getCarrierNameByClientId, getClientIdsByCarrierName } from '@deps/utils/carriers';
import { getSelectedCarriers } from '@deps/utils/carriers';

import DateRangeFields from './date-range-fields';
import MultiselectField from './multiselect-field';

const REFINE_RESULTS_BASE_KEY = 'caseManagementDashboard.refineResultsOptions.';

type Errors = {
    createdDateStart?: string;
    createdDateEnd?: string;
    updatedDateStart?: string;
    updatedDateEnd?: string;
};

export interface SideSheetRefineResultsProps {
    filters: CaseSearchAdditionalFilters;
    setCaseManagementFilters: Dispatch<SetStateAction<CaseSearchFilters>>;
    closeSideSheet: () => void;
    authorizedCarriers: string[];
}

export default function SideSheetRefineResults({
    filters,
    setCaseManagementFilters,
    closeSideSheet,
    authorizedCarriers,
}: SideSheetRefineResultsProps) {
    const { t } = useTranslation();
    const [additionalFilters, setAdditionalFilters] = useState(filters);
    const [productNameOptions, setProductNameOptions] = useState<string[]>([]);
    const [processListOptions, setProcessListOptions] = useState<string[]>([]);
    const [requestSubTypeOptions, setRequestSubTypeOptions] = useState<string[]>([]);
    const [loadingProductName, setLoadingProductName] = useState(false);
    const [loadingProcessList, setLoadingProcessList] = useState(false);
    const [loadingRequestSubType, setLoadingRequestSubType] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

    const carrierFilterItems = authorizedCarriers.map((carrierCode: string) => {
        const valueAndDisplay = getCarrierNameByClientId(carrierCode) || carrierCode.toUpperCase();

        return {
            value: getClientIdsByCarrierName(authorizedCarriers, valueAndDisplay),
            displayText: valueAndDisplay,
            label: getCarrierListItem(carrierCode),
        };
    });

    const getUniqueCarrierFilterItems = () => {
        const carrierLabels = new Set();

        const uniqueCarrierFilterItems = (
            carrierFilterItems.filter(item => {
                if (carrierLabels.has(item.displayText)) {
                    return false;
                }

                carrierLabels.add(item.displayText);
                return true;
            }) as typeof carrierFilterItems
        ).sort((item1, item2) => item1.displayText.localeCompare(item2.displayText));
        return uniqueCarrierFilterItems;
    };

    const selectedCarriers =
        carrierFilterItems.length === 1
            ? { [carrierFilterItems[0].value]: carrierFilterItems[0].displayText }
            : additionalFilters.carriers ?? {};

    // update ProductName when carrier changes
    useEffect(() => {
        
        const selectedCarriers = getSelectedCarriers(additionalFilters.carriers);
        if (selectedCarriers.length) {
            setLoadingProductName(true);

            const getProductNameRefData = async () => {
                const results = await getReferenceData({
                    carrier: selectedCarriers.map(perm => perm.toUpperCase()),
                    keys: ['productName'] as ReferenceDataQuery['keys'],
                });
                const newProductNames = results?.referenceData?.productName?.filter(Boolean) || [];

                setProductNameOptions(newProductNames);
                setAdditionalFilters(prevFilters => {
                    const updatedProducts = new Set(prevFilters.products);
                    const newProducts = new Set(newProductNames);
                    updatedProducts.forEach(product => !newProducts.has(product) && updatedProducts.delete(product));

                    return { ...prevFilters, products: updatedProducts };
                });
            };

            getProductNameRefData().then(() => setLoadingProductName(false));
        } else {
            setProductNameOptions([]);
            setAdditionalFilters(prevFilters => ({ ...prevFilters, products: filters.products }));
        }
    }, [authorizedCarriers, additionalFilters.carriers, filters.products]);

    // update ProcessList when Carriers changes
    useEffect(() => {
        setLoadingProcessList(true);

        const getProcessListRefData = async () => {
            const selectedCarriers = getSelectedCarriers(additionalFilters.carriers);
            const queryCarriers = selectedCarriers.length ? selectedCarriers : Object.keys(authorizedCarriers);
            const results = await getReferenceData({
                carrier: queryCarriers.map(perm => perm.toUpperCase()),
                keys: ['processList'] as ReferenceDataQuery['keys'],
            });
            const newProcessList = results?.referenceData.processList.filter(Boolean) || [];

            setProcessListOptions(newProcessList);
            setAdditionalFilters(prevFilters => {
                const updatedProcessList = new Set(prevFilters.processTypes);
                const newProcessListSet = new Set(newProcessList);
                updatedProcessList.forEach(processType => !newProcessListSet.has(processType) && updatedProcessList.delete(processType));

                return { ...prevFilters, processTypes: updatedProcessList };
            });
        };

        getProcessListRefData().then(() => setLoadingProcessList(false));
    }, [authorizedCarriers, additionalFilters.carriers, filters.processTypes]);

    // update RequestSubType when processList changes (which changes if Carrier Changes)
    useEffect(() => {
        const selectedProcesses = Array.from(additionalFilters.processTypes);

        if (selectedProcesses.length) {
            setLoadingRequestSubType(true);

            const getRequestSubTypeRefData = async () => {
                const selectedCarriers = getSelectedCarriers(additionalFilters.carriers);
                const queryCarriers = selectedCarriers.length ? selectedCarriers : Object.keys(authorizedCarriers);
                const results = await getReferenceData({
                    carrier: queryCarriers.map(perm => perm.toUpperCase()),
                    process: selectedProcesses,
                    keys: ['requestSubType'] as ReferenceDataQuery['keys'],
                });
                const newRequestSubTypes = results?.referenceData.requestSubType.filter(Boolean) || [];

                setRequestSubTypeOptions(newRequestSubTypes);
                setAdditionalFilters(prevFilters => {
                    const updatedSubTypes = new Set(prevFilters.requestSubType);
                    const newSubTypes = new Set(newRequestSubTypes);
                    updatedSubTypes.forEach(subType => !newSubTypes.has(subType) && updatedSubTypes.delete(subType));

                    return { ...prevFilters, requestSubType: updatedSubTypes };
                });
            };

            getRequestSubTypeRefData().then(() => setLoadingRequestSubType(false));
        } else {
            setRequestSubTypeOptions([]);
            setAdditionalFilters(prevFilters => ({ ...prevFilters, requestSubType: filters.requestSubType }));
        }
    }, [authorizedCarriers, additionalFilters.carriers, additionalFilters.processTypes, filters.requestSubType]);

    // Field Handlers
    const createdStartOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartValue = e.target.value;

        const isAfter = dayjs(newStartValue, NUMERIC_DATE_FORMAT).isAfter(dayjs(additionalFilters.createdDateEnd, NUMERIC_DATE_FORMAT));

        setAdditionalFilters(prevFilters => ({
            ...prevFilters,
            createdDateStart: newStartValue,
            createdDateEnd: isAfter ? '' : prevFilters.createdDateEnd,
        }));
    };

    const createdEndOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEndValue = e.target.value;

        setAdditionalFilters(prevFilters => {
            const isBefore = dayjs(newEndValue, NUMERIC_DATE_FORMAT).isBefore(dayjs(prevFilters.createdDateStart, NUMERIC_DATE_FORMAT));
            return {
                ...prevFilters,
                createdDateStart: isBefore ? newEndValue : prevFilters.createdDateStart,
                createdDateEnd: isBefore ? '' : newEndValue,
            };
        });
    };

    const updatedStartOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartValue = e.target.value;

        setAdditionalFilters(prevFilters => {
            const isAfter = dayjs(newStartValue, NUMERIC_DATE_FORMAT).isAfter(dayjs(prevFilters.updatedDateEnd, NUMERIC_DATE_FORMAT));
            return {
                ...prevFilters,
                updatedDateStart: newStartValue,
                updatedDateEnd: isAfter ? '' : prevFilters.updatedDateEnd,
            };
        });
    };

    const updatedEndOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEndValue = e.target.value;

        setAdditionalFilters(prevFilters => {
            const isBefore = dayjs(newEndValue, NUMERIC_DATE_FORMAT).isBefore(dayjs(prevFilters.updatedDateStart, NUMERIC_DATE_FORMAT));
            return {
                ...prevFilters,
                updatedDateStart: isBefore ? newEndValue : prevFilters.updatedDateStart,
                updatedDateEnd: isBefore ? '' : newEndValue,
            };
        });
    };

    const updateProcessFilters = (clickedProcessType: string) => {
        const newProcessTypes = new Set(additionalFilters.processTypes);

        if (newProcessTypes.has(clickedProcessType)) {
            newProcessTypes.delete(clickedProcessType);
        } else {
            newProcessTypes.add(clickedProcessType);
        }

        setAdditionalFilters(prevFilters => ({
            ...prevFilters,
            processTypes: newProcessTypes,
        }));
    };

    const updateCarrierFilters = (clickedCarrier: string, displayText: string) => {
        const newCarriersFilters = { ...additionalFilters.carriers };

        if (newCarriersFilters[clickedCarrier]) {
            delete newCarriersFilters[clickedCarrier];
        } else {
            newCarriersFilters[clickedCarrier] = displayText;
        }

        setAdditionalFilters(prevFilters => ({
            ...prevFilters,
            carriers: newCarriersFilters,
        }));
    };

    const updateProductNameFilters = (clickedProductName: string) => {
        const newProductNameFilters = new Set(additionalFilters.products);

        if (newProductNameFilters.has(clickedProductName)) {
            newProductNameFilters.delete(clickedProductName);
        } else {
            newProductNameFilters.add(clickedProductName);
        }

        setAdditionalFilters(prevFilters => ({
            ...prevFilters,
            products: newProductNameFilters,
        }));
    };

    const updateRequestSubTypeFilters = (clickedSubType: string) => {
        const newRequestSubTypes = new Set(additionalFilters.requestSubType);

        if (newRequestSubTypes.has(clickedSubType)) {
            newRequestSubTypes.delete(clickedSubType);
        } else {
            newRequestSubTypes.add(clickedSubType);
        }

        setAdditionalFilters(prevFilters => ({
            ...prevFilters,
            requestSubType: newRequestSubTypes,
        }));
    };

    const validateForm = () => {
        let errors: Errors = {};
        if (additionalFilters.createdDateStart && dayjs(additionalFilters.createdDateStart, NUMERIC_DATE_FORMAT).isAfter(dayjs())) {
            errors = { ...errors, createdDateStart: t(`${REFINE_RESULTS_BASE_KEY}date`) as string };
        }
        if (additionalFilters.createdDateEnd && dayjs(additionalFilters.createdDateEnd, NUMERIC_DATE_FORMAT).isAfter(dayjs())) {
            errors = { ...errors, createdDateEnd: t(`${REFINE_RESULTS_BASE_KEY}date`) as string };
        }
        if (additionalFilters.updatedDateStart && dayjs(additionalFilters.updatedDateStart, NUMERIC_DATE_FORMAT).isAfter(dayjs())) {
            errors = { ...errors, updatedDateStart: t(`${REFINE_RESULTS_BASE_KEY}date`) as string };
        }
        if (additionalFilters.updatedDateEnd && dayjs(additionalFilters.updatedDateEnd, NUMERIC_DATE_FORMAT).isAfter(dayjs())) {
            errors = { ...errors, updatedDateEnd: t(`${REFINE_RESULTS_BASE_KEY}date`) as string };
        }
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            setCaseManagementFilters(prevFilters => ({
                ...prevFilters,
                offset: 0,
                additionalFilters,
                ...((additionalFilters.showOnlyCanceledCases || additionalFilters.showOnlyCompletedCases) && {
                    statusCounterTileFilter: 'All',
                }),
            }));
            closeSideSheet();
        }
    };

    const handleReset = () => {
        setCaseManagementFilters(prevFilters => ({ ...prevFilters, offset: 0, additionalFilters: initialAdditionalFilters }));
        closeSideSheet();
    };

    // Render
    return (
        <div className="flex flex-col px-8">
            <div className="border-b-2 border-b-gray-100 py-8">
                <Select
                    isMultiselect
                    label={t(`${REFINE_RESULTS_BASE_KEY}carrier`) as string}
                    options={getUniqueCarrierFilterItems()}
                    value={selectedCarriers}
                    onChange={updateCarrierFilters}
                    size={FieldSize.Small}
                    placeholder={t(`${REFINE_RESULTS_BASE_KEY}selectCarrier`) as string}
                    disabled={carrierFilterItems.length === 1}
                    name="carrier-dropdown-btn"
                />
                <MultiselectField
                    isLoading={loadingProductName}
                    label={t(`${REFINE_RESULTS_BASE_KEY}productName`) as string}
                    options={productNameOptions}
                    value={additionalFilters.products ?? {}}
                    handleChange={updateProductNameFilters}
                />
            </div>
            <div className={Object.keys(selectedCarriers).length ?`border-b-2 border-b-gray-100 pb-8` : ''}>
                <MultiselectField
                    isLoading={loadingProcessList}
                    label={t(`${REFINE_RESULTS_BASE_KEY}processType`) as string}
                    options={processListOptions}
                    value={additionalFilters.processTypes ?? {}}
                    handleChange={updateProcessFilters}
                />
                <MultiselectField
                    isLoading={loadingRequestSubType}
                    label={t(`${REFINE_RESULTS_BASE_KEY}requestSubtype`) as string}
                    options={requestSubTypeOptions}
                    value={additionalFilters.requestSubType ?? {}}
                    handleChange={updateRequestSubTypeFilters}
                />
            </div>
            <DateRangeFields
                additionalFilters={additionalFilters}
                errors={errors}
                createdStartOnChange={createdStartOnChange}
                createdEndOnChange={createdEndOnChange}
                updatedStartOnChange={updatedStartOnChange}
                updatedEndOnChange={updatedEndOnChange}
            />
            <div className="flex flex-col gap-12 py-8">
                <Select
                    options={[
                        { label: `${t('temporal.days', { min: 0, max: 7 })}`, value: '7' },
                        { label: `${t('temporal.days', { min: 7, max: 14 })}`, value: '14' },
                        { label: `${t('temporal.days', { min: 15, max: 30 })}`, value: '30' },
                        { label: `${t('temporal.daysMax', { min: 31 })}`, value: '31' },
                    ]}
                    onChange={(value: string) => setAdditionalFilters(prevFilters => ({ ...prevFilters, age: value }))}
                    value={additionalFilters.age || ''}
                    size={FieldSize.Small}
                    label={t(`${REFINE_RESULTS_BASE_KEY}age`) as string}
                    placeholder={t(`${REFINE_RESULTS_BASE_KEY}selectDayRange`) as string}
                    className="!w-[198px]"
                />
                <Toggle
                    text={t(`${REFINE_RESULTS_BASE_KEY}showOnlyCompleted`) as string}
                    value={additionalFilters.showOnlyCompletedCases}
                    ariaLabel={t('ariaLabel.showOnlyCompletedCases') as string}
                    handleToggle={() =>
                        setAdditionalFilters(prevFilters => ({
                            ...prevFilters,
                            showOnlyCompletedCases: !additionalFilters.showOnlyCompletedCases,
                        }))
                    }
                />
                <Toggle
                    text={t(`${REFINE_RESULTS_BASE_KEY}showOnlyCanceled`) as string}
                    value={additionalFilters.showOnlyCanceledCases}
                    ariaLabel={t('ariaLabel.showOnlyCanceledCases') as string}
                    handleToggle={() =>
                        setAdditionalFilters(prevFilters => ({
                            ...prevFilters,
                            showOnlyCanceledCases: !additionalFilters.showOnlyCanceledCases,
                        }))
                    }
                />
                <div className="flex flex-row">
                    <Button
                        type={ButtonType.Primary}
                        onClick={handleSubmit}
                        aria-label={t('ariaLabel.applyFilters') as string}
                        className="mr-6"
                    >
                        <p className="font-primary text-[18px] font-semibold leading-6.5">{t(`${REFINE_RESULTS_BASE_KEY}applyFilters`)}</p>
                    </Button>
                    <NavElement
                        type={NavElementType.Button}
                        className="flex self-center whitespace-nowrap"
                        onClick={handleReset}
                        aria-label={t('ariaLabel.clearAllFilters') as string}
                    >
                        {t(`${REFINE_RESULTS_BASE_KEY}clearAll`)}
                    </NavElement>
                </div>
            </div>
        </div>
    );
}
