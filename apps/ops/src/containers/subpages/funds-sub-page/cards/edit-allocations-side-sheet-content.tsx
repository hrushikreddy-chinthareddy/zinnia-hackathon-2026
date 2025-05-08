import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import { ButtonSize } from '@deps/components/button/button';
import CardCaseDocument from '@deps/components/card/card-case-document/card-case-document';
import { CaseDocumentOption, PROCESS_WITHOUT_CASE_DOCUMENT } from '@deps/components/case-document-select/case-document-select';
import Field, { FieldFormat, FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import FieldDateSelect from '@deps/components/fields/field-date-select/field-date-select';
import { Label, LabelVariant } from '@deps/components/label/label';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import SpinnerButton from '@deps/components/spinner-button/spinner-button';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { SideSheetContextProps } from '@deps/contexts/SideSheetContext';
import { getCaseIdentifierValue } from '@deps/helpers/case-management';
import { CaseIdentifier, Statuses } from '@deps/models/case/case';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { getCases } from '@deps/queries/api/cases';
import { fundAllocation, validateFundAllocation } from '@deps/queries/api/fund-allocation';
import { ReactComponent as ClockIcon } from '@deps/styles/elements/icons/icons_outlined/clock.svg';
import { NUMERIC_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { FundViewModel } from '../types';
import { AllocationSuccessFlow } from './allocation-success-flow';
import { EditAllocationNigo } from './edit-allocations-nigo';
import { EditAllocationsNigoSuccess } from './edit-allocations-nigo-success';
import { EditAllocationSuccess } from './edit-allocations-success';
import { EditAllocationsSystemDown } from './edit-allocations-system-down';

interface IEditAllocationsContent {
    funds?: FundViewModel[];
    notElectedfunds?: FundViewModel[];
    policyNumber?: string;
    planCode: string;
    sideSheet: SideSheetContextProps;
    investmentType?: string;
    policyOwner: string;
}

export const EditAllocationsContent: React.FC<IEditAllocationsContent> = ({
    funds,
    policyNumber,
    notElectedfunds,
    planCode,
    sideSheet,
    investmentType,
    policyOwner,
}) => {
    const { t } = useTranslation();
    const { featureFlags } = useOptimizely();
    const [caseOptions, setCaseOptions] = useState<CaseDocumentOption[]>([]);
    const numberFormat = { type: 'number' as FieldFormat, decimalPlaces: 2, format: '' };
    const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>(policyNumber);
    const [showSelectionError, setShowSelectionError] = useState<boolean>(false);

    const [allFunds, setAllFunds] = useState([...(funds ?? []), ...(notElectedfunds ?? [])]);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSuccessFlow, setIsSuccessFlow] = useState(false);
    const [isSystenDown, setIsSystenDown] = useState(false);
    const [isNigo, setIsNigo] = useState(false);
    const [nigoSuccess, setNigoSuccess] = useState(false);
    const [effectiveDate, setEffectiveDate] = useState(dayjs().format('MMDDYYYY'));
    const [effectiveDateError, setEffectiveDateError] = useState(false);
    const [stopLoading, setStopLoading] = useState(true);
    const [successCaseId, setSuccessCaseId] = useState('');

    useEffect(() => {
        async function populateCaseSelect() {
            const noDocument = {
                documentNumber: t('workflows.start.processWithoutDocument'),
                caseId: '',
                value: PROCESS_WITHOUT_CASE_DOCUMENT,
            };
            const response = await getCases(
                {
                    limit: 25,
                    notInCaseStatus: [Statuses.Canceled, Statuses.Completed],
                    policyNumber: policyNumber,
                    process: ['Systematic Program Update'],
                },
                featureFlags
            );

            if (response && 'total' in response) {
                const mappedCaseOptions: CaseDocumentOption[] = response.data.map(caseDetails => {
                    const documentNumber = getCaseIdentifierValue(caseDetails.identifiers, CaseIdentifier.DocumentNumber);
                    return {
                        documentNumber: documentNumber || '',
                        caseId: caseDetails.id,
                        tag: `${caseDetails?.process || ''} - ${caseDetails?.processSubType || ''}`,
                        value: caseDetails.id,
                    };
                });
                setCaseOptions([...mappedCaseOptions, noDocument]);
            } else {
                // TODO MG: handle
                setCaseOptions([noDocument]);
                // TODO MG: ensure this doesnt blow up
                throw new Error(response?.data?.err ? response.data.err : 'Error fetching cases');
            }
        }

        populateCaseSelect();
    }, [featureFlags, policyNumber, t]);

    useEffect(() => {
        // Convert initial % strings to numbers
        const parsed = allFunds?.map(item => ({
            ...item,
            allocation: item.allocation === '--' ? '0' : item.allocation?.replace('%', ''),
        }));
        setAllFunds(parsed);
    }, []);

    useEffect(() => {
        let newTotal = 0;
        let hasInvalidNumbers = false;

        allFunds?.forEach(item => {
            const value = item.allocation;
            if (value === '--' || value === '' || value === undefined) return;

            if (!Number.isInteger(Number(value))) {
                hasInvalidNumbers = true;
            } else {
                newTotal += Number(value);
            }
        });

        setTotal(newTotal);

        if (hasInvalidNumbers) {
            setError(t('fundAllocation.validNumErr') as string);
        } else if (newTotal !== 100) {
            setError(t('fundAllocation.allocationErr') as string);
        } else {
            setError('');
        }
    }, [allFunds]);

    const handleSelection = (caseId: string) => {
        if (selectedCaseId === caseId) {
            setSelectedCaseId(undefined);
        } else {
            setSelectedCaseId(caseId);
        }
        setShowSelectionError(false);
    };

    const handleChange = (index: number, value: string) => {
        if (allFunds !== undefined) {
            const updatedFunds = [...allFunds];
            const floatValue = parseFloat(value);
            if (!isNaN(floatValue) || value === '') {
                updatedFunds[index].allocation = value === '' ? '' : floatValue.toString();
                setAllFunds(updatedFunds);
            }
        }
    };

    if (success) {
        return <EditAllocationSuccess caseId={successCaseId} sideSheet={sideSheet} policyOwner={policyOwner} />;
    }

    if (isSystenDown) {
        return (
            <EditAllocationsSystemDown
                sideSheet={sideSheet}
                setIsSystenDown={setIsSystenDown}
                setIsNigo={setIsNigo}
                setIsSuccessFlow={setIsSuccessFlow}
            />
        );
    }
    const getAllocationPayload = () => {
        const effectiveDateFormatted =
            effectiveDate.length > 0 ? dayjs(effectiveDate, NUMERIC_DATE_FORMAT).format(ZAHARA_API_DATE_FORMAT) : '';
        const fundAllocationsInvestments = allFunds?.map(item => {
            return {
                fundId: item.fundId ?? '',
                allocationPercentage: Number(item.allocation),
                startDate: effectiveDateFormatted,
            };
        });
        setStopLoading(false);

        const allocationsPayload = {
            effectiveDate: effectiveDateFormatted,
            correlationid: uuidv4(),
            caseId: '',
            reverseInitiator: false,
            allocation: {
                investmentType: investmentType ?? '',
                modelId: '',
                fundAllocationsInvestments: fundAllocationsInvestments ?? [],
            },
            allocationOption: '',
        };
        return allocationsPayload;
    };

    const submitHandler = async (location: string) => {
        const fundAllocationResponse = await fundAllocation(planCode, policyNumber, getAllocationPayload());
        if (fundAllocationResponse === 'System down') {
            setIsSystenDown(true);
        }
        if (fundAllocationResponse?.caseStatus === 'IN_PROGRESS' || fundAllocationResponse?.caseStatus === 'EXCEPTION') {
            setIsNigo(false);
            if (location === 'successFlow') {
                setIsSuccessFlow(true);
            } else {
                setNigoSuccess(true);
            }
            setSuccessCaseId(fundAllocationResponse.caseId);
            setSuccess(true);
        }
    };

    if (isSuccessFlow) {
        return (
            <AllocationSuccessFlow
                allFunds={allFunds}
                total={total}
                sideSheet={sideSheet}
                submitHandler={submitHandler}
                setIsSuccessFlow={setIsSuccessFlow}
            />
        );
    }

    if (isNigo) {
        return (
            <EditAllocationNigo
                allFunds={allFunds}
                setIsNigo={setIsNigo}
                total={total}
                error={error}
                sideSheet={sideSheet}
                submitHandler={submitHandler}
            />
        );
    }

    if (nigoSuccess) {
        return <EditAllocationsNigoSuccess sideSheet={sideSheet} />;
    }

    const updateAllocationHandler = async () => {
        const selectedOption = caseOptions.find(option => option.value === selectedCaseId);
        effectiveDate.length > 0 ? setEffectiveDateError(false) : setEffectiveDateError(true);
        const effectiveDateFormatted =
            effectiveDate.length > 0 ? dayjs(effectiveDate, NUMERIC_DATE_FORMAT).format(ZAHARA_API_DATE_FORMAT) : '';
        if (!selectedOption) {
            setShowSelectionError(true);
            return;
        }
        setShowSelectionError(false);

        if (error || !effectiveDateFormatted.length) {
            return;
        }
        const validateResponse = await validateFundAllocation(planCode, policyNumber, getAllocationPayload());
        if (validateResponse === 'System down') {
            setIsSystenDown(true);
        }
        if (validateResponse?.status === TransactionResponseStatus.Success) {
            setIsSuccessFlow(true);
        } else {
            setIsNigo(true);
        }
        setStopLoading(true);
    };

    return (
        <div className="flex flex-col p-8 h-full">
            <div className="flex flex-col">
                <Label
                    className="mb-4"
                    label={t('workflows.start.documentSelectionLabel')}
                    sentenceCase={false}
                    variant={LabelVariant.LabelLg}
                />
                <div className="grid max-w-[436px] gap-2">
                    {caseOptions
                        .sort((a, b) => (a.documentNumber ?? '').localeCompare(b.documentNumber ?? ''))
                        .map(option => (
                            <CardCaseDocument
                                caseDocumentOption={option}
                                isSelected={selectedCaseId === PROCESS_WITHOUT_CASE_DOCUMENT}
                                key={option.value}
                                onChange={() => handleSelection(option.value as string)}
                            />
                        ))}
                </div>
                {(selectedCaseId === PROCESS_WITHOUT_CASE_DOCUMENT || showSelectionError) && (
                    <div className="flex flex-col gap-2 mt-2">
                        {selectedCaseId === PROCESS_WITHOUT_CASE_DOCUMENT && (
                            <AssistiveText
                                variant={AssistiveTextVariant.Info}
                                text={
                                    // eslint-disable-next-line no-constant-condition
                                    true
                                        ? t('workflows.start.processWithoutDocAssistiveTextWithOnBaseUpdate')
                                        : t('workflows.start.processWithoutDocAssistiveText')
                                }
                            />
                        )}
                        {showSelectionError && (
                            <AssistiveText variant={AssistiveTextVariant.Error} text={t('workflows.start.missingSelection')} />
                        )}
                    </div>
                )}
            </div>

            <div className="gap-3 max-w-[155px] pt-10">
                <FieldDateSelect
                    variant={effectiveDateError ? FieldVariant.Error : FieldVariant.Default}
                    label={t('fundAllocation.effectivedate') as string}
                    id="effectiveDate"
                    isFutureDateDisabled={false}
                    onChange={e => {
                        e.target.value.length > 0 ? setEffectiveDateError(false) : setEffectiveDateError(true);
                        setEffectiveDate(e.target.value);
                    }}
                    formatOptions={{ format: '##/##/####' }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={effectiveDate}
                    labelTooltip={t(`fundAllocation.effectivedate`) as string}
                    labelTooltipBody={t(`fundAllocation.effectivedate`) as string}
                    placeholder={t(`fundAllocation.selectdate`) as string}
                />
            </div>

            <div className="pt-1">
                {effectiveDateError && <AssistiveText variant={AssistiveTextVariant.Error} text={t('fundAllocation.effectiveDateError')} />}
            </div>

            <div>
                <div className="flex justify-between pt-10">
                    <Typography variant={TypographyVariant.LabelLg}>{t('fundAllocation.availableFunds')}</Typography>
                    <Typography variant={TypographyVariant.LabelLg}>{t('fundAllocation.allocation')}</Typography>
                </div>
                <div>
                    {allFunds?.map((fund, index) => {
                        return (
                            <div className="flex pt-6 justify-between break-normal" key={fund.fundId}>
                                <div className="max-w-[240px]">
                                    <Typography variant={TypographyVariant.LabelMdAlt}>{fund.fundName}</Typography>
                                </div>

                                <span className="max-w-[94px]">
                                    <Field
                                        formatOptions={numberFormat}
                                        onChange={e => {
                                            handleChange(index, e.target.value);
                                        }}
                                        size={FieldSize.Small}
                                        trailing={<div>%</div>}
                                        type={FieldType.BaseActive}
                                        value={fund.allocation || ''}
                                    />
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-between pt-8">
                <Typography variant={TypographyVariant.LabelLg}>{t('fundAllocation.total')}</Typography>
                <Typography variant={TypographyVariant.LabelLg}>{total}%</Typography>
            </div>
            <div className="flex justify-end">
                {error && (
                    <div className="flex items-center pt-2">
                        <AssistiveText variant={AssistiveTextVariant.Error} text={t(error)} />
                    </div>
                )}
            </div>

            <div className="flex pt-10">
                <span className="mr-6">
                    <SpinnerButton
                        stopLoading={stopLoading}
                        size={ButtonSize.Small}
                        text={t('fundAllocation.updateAllocations')}
                        onClick={updateAllocationHandler}
                    />
                </span>
                <NavElement
                    aria-label={t('formControls.cancel') as string}
                    onClick={() => {
                        sideSheet?.handleOpen(false);
                    }}
                    size={NavElementSize.Small}
                    type={NavElementType.Button}
                    variant={NavElementVariant.Default}
                >
                    {t('fundAllocation.cancel')}
                </NavElement>
            </div>

            {!stopLoading && (
                <div className="pt-4">
                    <AssistiveText iconOverride={<ClockIcon height={16} width={16} />} text={t('fundAllocation.checkingInfo')} />
                </div>
            )}
        </div>
    );
};
