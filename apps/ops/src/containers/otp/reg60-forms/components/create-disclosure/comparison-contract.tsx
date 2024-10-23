import clsx from 'clsx';
import dayjs from 'dayjs';
import { TFunction , useTranslation } from 'next-i18next';
import { ChangeEvent, useContext } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Field, { FieldSize, FieldType } from '@deps/components/fields/field';
import FieldDateSelect from '@deps/components/fields/field-date-select/field-date-select';
import { selectVarientByConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import Popover, { PopoverPlacement } from '@deps/components/popover/popover';
import SelectSimple from '@deps/components/select/select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { Reg60FormContext } from '@deps/contexts/Reg60FormContext';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';
import { NUMERIC_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { Benefit, ComparisonContractProps, ComparisonType, ContractComparisonTableConfig } from './create-disclosure.types';
import getMassMutualReg60Config from '../../mass-mutual/mass-mutual-reg60-form-helper';
import { FIVE_YEAR, SURRENDER_BENEFITS, TEN_YEAR, amountFormat, numberFormat } from '../../utils/reg60-constants';
import AppliedCharges from '../applied-charges/applied-charges';
import BenefitsTable from '../comparison-benefits/benefits-table';
import { RowConfig } from '../comparison-benefits/benefits-table.types';
import { Products } from '../disclosure-authorization/disclosure-authorization.types';
import ProposedAnnuityQuote from '../proposed-annuity-quote/proposed-annuity-quote';
import { AnnuityQuote } from '../proposed-annuity-quote/proposed-annuity-quote.types';

const getComparisonTypeOptions = (t: TFunction) => [
    { label: t('comparisonTypes.veriableToFixed'), value: ComparisonType.VARIABLE_TO_FIXED },
    { label: t('comparisonTypes.VeriableToImmediate'), value: ComparisonType.VARIABLE_TO_IMMEDIATE },
    { label: t('comparisonTypes.fixedToFixed'), value: ComparisonType.FIXED_TO_FIXED },
    { label: t('comparisonTypes.fixedToImmediate'), value: ComparisonType.FIXED_TO_IMMEDIATE },
];

const ComparisonContract = ({
    comparisonContract,
    formConfigs,
    title,
    formErrors = {},
    onComparisonContractChange,
}: ComparisonContractProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseReg60.request' });
    const { annuitizationQuoteConfig } = getMassMutualReg60Config(t);
    const { disclosureAuthorization, isFormStateReadOnly } = useContext(Reg60FormContext);
    const { field } = formConfigs;

    const handleBenefitTableChange = (tableData: RowConfig[], key: string) => {
        const comparisonClone = { ...comparisonContract };
        const updatedTable = tableData.map((table, i) => ({ ...table, period: `${i === 0 ? FIVE_YEAR : TEN_YEAR}` }));
        if (key === SURRENDER_BENEFITS) {
            comparisonClone.carrierBenefits.surrenderBenefit = updatedTable;
        } else {
            comparisonClone.carrierBenefits.deathBenefit = updatedTable;
        }
        onComparisonContractChange(comparisonClone);
    };

    const handleIssueDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const formattedDate = dayjs(e.target.value, NUMERIC_DATE_FORMAT).format(ZAHARA_API_DATE_FORMAT);
        if (dayjs(formattedDate).isValid()) {
            onComparisonContractChange({
                ...comparisonContract,
                issueDate: formattedDate,
            });
        }
    };

    const handleAnnuitizationValueReceived = () => {
        onComparisonContractChange({
            ...comparisonContract,
            annuitizationValueReceived: !comparisonContract.annuitizationValueReceived,
            annuitizationQuote: {
                annuityPaymentAmount: '',
                firstPaymentDate: '',
                paymentFrequency: '',
                incomeOption: '',
                typeOfPayment: '',
                periodCertainYears: '',
            },
        });
    };

    const handleAnnuityQuoteChange = (data: AnnuityQuote) => {
        onComparisonContractChange({
            ...comparisonContract,
            annuitizationQuote: data,
        });
    };

    const showAnnuitizationValueReceived = !!(
        disclosureAuthorization.product === Products.retireEase || disclosureAuthorization.product === Products.retireEaseChoice
    );

    return (
        <>
            <div>
                <Typography className="my-4" variant={TypographyVariant.H2}>
                    {title}
                </Typography>
            </div>
            <div className="my-6">
                {field.comparisonType && (
                    <div className="mb-4 max-w-xs">
                        <div className="max-w-lg">
                            <SelectSimple
                                disabled={isFormStateReadOnly}
                                label={field.comparisonType.fieldLabel}
                                value={comparisonContract.comparisonType}
                                onChange={val =>
                                    onComparisonContractChange({ ...comparisonContract, comparisonType: val as ComparisonType })
                                }
                                options={getComparisonTypeOptions(t)}
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                            />
                        </div>
                    </div>
                )}

                {field.partialRequest && (
                    <div className="my-1 mb-4 max-w-xs">
                        <CheckboxText
                            isDisabled={isFormStateReadOnly}
                            label={field.partialRequest.fieldLabel}
                            checked={comparisonContract.partialRequest}
                            onClick={() =>
                                onComparisonContractChange({ ...comparisonContract, partialRequest: !comparisonContract.partialRequest })
                            }
                        />
                    </div>
                )}

                {field.goodFaithEstimateRequired && (
                    <div className="my-1 mb-4 flex max-w-xs">
                        <CheckboxText
                            isDisabled={isFormStateReadOnly}
                            label={field.goodFaithEstimateRequired.fieldLabel}
                            checked={comparisonContract.goodFaithEstimateRequired}
                            onClick={() =>
                                onComparisonContractChange({
                                    ...comparisonContract,
                                    goodFaithEstimateRequired: !comparisonContract.goodFaithEstimateRequired,
                                })
                            }
                        />
                        <div className="mx-2">
                            <Popover
                                triggerClassName="mb-4"
                                title={t('contractComparison.info') as string}
                                body={t('contractComparison.goodFaithEstimateInfo')}
                                placement={PopoverPlacement.TopRight}
                            >
                                <span className="block p-[5px]">
                                    <CircleInfoIcon height={'16px'} width={'16px'} className="text-primary" />
                                </span>
                            </Popover>
                        </div>
                    </div>
                )}
                <div className="flex flex-row gap-4">
                    {field.companyName && (
                        <div className="col-span-2 mb-4 basis-80">
                            <Field
                                className={formErrors?.companyName && 'border-2 border-solid border-semantic-error'}
                                label={field.companyName.fieldLabel}
                                onChange={e => onComparisonContractChange({ ...comparisonContract, companyName: e.target.value })}
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={comparisonContract.companyName}
                                message={formErrors?.companyName}
                                variant={selectVarientByConfig({
                                    value: comparisonContract?.companyName,
                                    isFormStateReadOnly,
                                    error: formErrors?.companyName,
                                })}
                                required
                            />
                        </div>
                    )}
                    {field.companyPhoneNumber && (
                        <div className="mb-4 max-w-xs ">
                            <Field
                                label={field.companyPhoneNumber.fieldLabel}
                                onChange={e =>
                                    onComparisonContractChange({ ...comparisonContract, companyPhoneNumber: e.target.value as string })
                                }
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={comparisonContract.companyPhoneNumber}
                                formatOptions={numberFormat}
                                message={formErrors?.companyPhoneNumber}
                                variant={selectVarientByConfig({
                                    value: comparisonContract?.companyPhoneNumber,
                                    isFormStateReadOnly,
                                    error: formErrors?.companyPhoneNumber,
                                })}
                                required
                            />
                        </div>
                    )}
                </div>
                {field.contractNumber && (
                    <div className="mb-4 max-w-xs">
                        <Field
                            className={formErrors?.contractNumber && 'border-2 border-solid border-semantic-error'}
                            label={field.contractNumber.fieldLabel}
                            onChange={e => onComparisonContractChange({ ...comparisonContract, contractNumber: e.target.value })}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={comparisonContract.contractNumber}
                            message={formErrors?.contractNumber}
                            variant={selectVarientByConfig({
                                value: comparisonContract?.contractNumber,
                                isFormStateReadOnly,
                                error: formErrors?.contractNumber,
                            })}
                            required
                        />
                    </div>
                )}
                {field.issueDate && (
                    <div className="mb-4 max-w-xs">
                        <FieldDateSelect
                            className={formErrors?.issueDate && 'border-2 border-solid border-semantic-error'}
                            label={field.issueDate.fieldLabel}
                            onChange={handleIssueDateChange}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={
                                comparisonContract.issueDate
                                    ? dayjs(comparisonContract.issueDate, 'YYYY-MM-DD').format(NUMERIC_DATE_FORMAT)
                                    : ''
                            }
                            message={formErrors?.issueDate}
                            variant={selectVarientByConfig({
                                value: comparisonContract?.issueDate || '',
                                isFormStateReadOnly,
                                error: formErrors?.issueDate,
                            })}
                            required
                        />
                    </div>
                )}

                {field.accountValue && (
                    <div className="mb-4 max-w-xs">
                        <Field
                            className={formErrors?.accountValue && 'border-2 border-solid border-semantic-error'}
                            label={field.accountValue.fieldLabel}
                            leading={<div>$</div>}
                            onChange={e => onComparisonContractChange({ ...comparisonContract, accountValue: e.target.value })}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={isNaN(comparisonContract.accountValue as number) ? '' : (comparisonContract.accountValue as string)}
                            message={formErrors?.accountValue}
                            variant={selectVarientByConfig({
                                value: String(comparisonContract.accountValue),
                                isFormStateReadOnly,
                                error: formErrors?.accountValue,
                            })}
                            required
                            formatOptions={amountFormat}
                        />
                    </div>
                )}
                {field.surrenderChargeApplies && (
                    <div className="mb-4 max-w-xs">
                        <AppliedCharges
                            className={formErrors?.surrenderCharge && 'border-2 border-solid border-semantic-error'}
                            checkboxLabel={field.surrenderChargeApplies.fieldLabel || ''}
                            textInputLabel={t('contractComparison.surrenderChargeAmount')}
                            amountValue={comparisonContract.surrenderCharge?.amount}
                            formError={formErrors?.surrenderCharge}
                            onDataChange={val => {
                                onComparisonContractChange({ ...comparisonContract, surrenderCharge: val });
                            }}
                            required
                            isChecked={comparisonContract.surrenderCharge?.applicable}
                            isFormStateReadOnly={isFormStateReadOnly}
                        />
                    </div>
                )}

                {field.mvaApplies && (
                    <div className="mb-4 max-w-xs">
                        <AppliedCharges
                            className={formErrors?.mvaAmount && 'border-2 border-solid border-semantic-error'}
                            checkboxLabel={field.mvaApplies.fieldLabel || ''}
                            textInputLabel={t('contractComparison.mvaAmount')}
                            amountValue={comparisonContract?.mvaAmount?.amount}
                            formError={formErrors?.mvaAmount}
                            required
                            onDataChange={val => {
                                onComparisonContractChange({ ...comparisonContract, mvaAmount: val });
                            }}
                            isChecked={comparisonContract.mvaAmount?.applicable}
                            isFormStateReadOnly={isFormStateReadOnly}
                        />
                    </div>
                )}

                {field.surrenderValue && (
                    <div className="max-w-xs">
                        <Field
                            className={formErrors?.surrenderValue && 'border-2 border-solid border-semantic-error'}
                            leading={<div>$</div>}
                            label={field.surrenderValue.fieldLabel}
                            onChange={e => onComparisonContractChange({ ...comparisonContract, surrenderValue: e.target.value })}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={isNaN(comparisonContract.surrenderValue as number) ? '' : (comparisonContract.surrenderValue as string)}
                            message={formErrors?.surrenderValue}
                            variant={selectVarientByConfig({
                                value: String(comparisonContract.surrenderValue),
                                isFormStateReadOnly,
                                error: formErrors?.surrenderValue,
                            })}
                            formatOptions={amountFormat}
                            required
                        />
                    </div>
                )}
                {field.annuitizationValueReceived && showAnnuitizationValueReceived && (
                    <div className="my-5 max-w-xs">
                        <CheckboxText
                            isDisabled={isFormStateReadOnly}
                            checked={comparisonContract.annuitizationValueReceived}
                            label={field.annuitizationValueReceived.fieldLabel}
                            onClick={handleAnnuitizationValueReceived}
                        />
                    </div>
                )}
                {comparisonContract.annuitizationValueReceived && (
                    <ProposedAnnuityQuote
                        annuityQuote={comparisonContract?.annuitizationQuote}
                        onAnnuityQuoteChange={handleAnnuityQuoteChange}
                        formConfig={annuitizationQuoteConfig}
                        contractId={comparisonContract.comparisonId}
                    />
                )}
            </div>
            {formConfigs?.table &&
                formConfigs?.table?.map((item: ContractComparisonTableConfig) => {
                    const columnSpecs =
                        comparisonContract.comparisonType === ComparisonType.FIXED_TO_FIXED ||
                        comparisonContract.comparisonType === ComparisonType.FIXED_TO_IMMEDIATE
                            ? item?.colConfigFixed
                            : item.colConfigVariable;
                    let columnSpecsClone = columnSpecs;
                    if (isFormStateReadOnly) columnSpecsClone = columnSpecs.map(item => ({ ...item, editable: !isFormStateReadOnly }));

                    const benefitType = item.key;
                    const initialData = comparisonContract?.carrierBenefits[benefitType]?.map((value: Benefit, i: number) => ({
                        ...value,
                        period: item.rowConfig[i].period,
                        editable: !isFormStateReadOnly,
                    }));
                    return (
                        <div key={item.title} data-testid="benefits-table">
                            <div key={item.title} className="my-3 mt-8">
                                <Typography className="mb-4" variant={TypographyVariant.H3}>
                                    {item.title}
                                </Typography>
                            </div>
                            <BenefitsTable
                                rowConfig={item?.rowConfig}
                                colConfig={columnSpecsClone}
                                initialData={initialData}
                                onBenefitTableChange={(tableData: RowConfig[]) => handleBenefitTableChange(tableData, item.key)}
                                tableWrapperClassName={clsx({
                                    'h-[130px] w-[602px]': comparisonContract.comparisonType === ComparisonType.FIXED_TO_FIXED,
                                    'h-[135px] w-[800px]': comparisonContract.comparisonType !== ComparisonType.FIXED_TO_FIXED,
                                })}
                            />
                        </div>
                    );
                })}
        </>
    );
};

export default ComparisonContract;
