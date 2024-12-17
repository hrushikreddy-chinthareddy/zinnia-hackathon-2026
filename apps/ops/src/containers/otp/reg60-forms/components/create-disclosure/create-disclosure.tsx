import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@deps/components/button/button';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { Breadcrumb } from '@deps/containers/policy-details/breadcrumb';
import { Reg60FormContext } from '@deps/contexts/Reg60FormContext';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { ReactComponent as CancelIcon } from '@deps/styles/elements/icons/actions/cancel.svg';

import ComparisonContract from './comparison-contract';
import { ContractComparison, CreateDisclosureProps } from './create-disclosure.types';
import getMassMutualReg60Config from '../../mass-mutual/mass-mutual-reg60-form-helper';
import { CurrentPage } from '../../reg60.types';
import { LAST_COMPARISON, MAX_COMPARISON } from '../../utils/reg60-constants';
import { getCreateDisclosureInfo } from '../../utils/reg60-form-helper';
import { Products } from '../disclosure-authorization/disclosure-authorization.types';
import ProposedAnnuityQuote from '../proposed-annuity-quote/proposed-annuity-quote';
import { AnnuityQuote } from '../proposed-annuity-quote/proposed-annuity-quote.types';

const CreateDisclosure = ({ disclosure, onDisclosureChange, formConfig }: CreateDisclosureProps) => {
    const { t } = useTranslation(TranslationFiles.REG60DEFS, { keyPrefix: 'caseReg60.request' });
    const { isFormStateReadOnly, setCurrentPage, formErrors, disclosureAuthorization } = useContext(Reg60FormContext);
    const { proposedAnnuityQuoteConfig } = getMassMutualReg60Config(t);

    const allContractComparison = disclosure.contractComparison;
    const isComparisonLimitReached = allContractComparison?.length >= MAX_COMPARISON;

    const handleRemoveComparison = (idx: number) => {
        const result = [...allContractComparison.slice(0, idx), ...allContractComparison.slice(idx + 1)];
        onDisclosureChange({ ...disclosure, contractComparison: result });
    };

    const handleAddNewComparison = () => {
        if (isComparisonLimitReached) return;
        const newComparison = [
            ...allContractComparison,
            {
                ...getCreateDisclosureInfo()[0],
                comparisonId: allContractComparison[allContractComparison.length - 1].comparisonId + 1,
            },
        ];
        onDisclosureChange({ ...disclosure, contractComparison: newComparison });
    };

    const handleComparisonContractChange = (comparisonData: ContractComparison, changedIndex: number) => {
        const updatedComp = allContractComparison?.map((contractComp: ContractComparison, ind: number) => {
            if (changedIndex !== ind) {
                return contractComp;
            }
            return comparisonData;
        });
        onDisclosureChange({ ...disclosure, contractComparison: updatedComp });
    };

    const handelAnnuityUpdate = (annuityData: AnnuityQuote) => {
        onDisclosureChange({ ...disclosure, proposedAnnuitizationQuote: annuityData });
    };

    const renderProposedAnnuity = (disclosureAuthorization.product === Products.retireEase ||
        disclosureAuthorization.product === Products.retireEaseChoice) && (
        <ProposedAnnuityQuote
            annuityQuote={disclosure?.proposedAnnuitizationQuote}
            onAnnuityQuoteChange={handelAnnuityUpdate}
            formConfig={proposedAnnuityQuoteConfig}
            product={disclosureAuthorization.product}
        />
    );

    return (
        <div>
            <div role="button" className="float-right my-[-40px] px-4 py-[5px]" onClick={() => setCurrentPage(CurrentPage.INFO)}>
                <Breadcrumb h1={''} text={t('contractComparison.back') || 'back'} url={'#'} />
            </div>
            <Typography className="my-4" variant={TypographyVariant.H1} data-testid="disclosure-title">
                {t('contractComparison.createDisclosureHeader')}
            </Typography>
            {renderProposedAnnuity}
            {allContractComparison &&
                allContractComparison?.map((contract: ContractComparison, index: number) => {
                    return (
                        <div key={'contract-comparison' + contract?.comparisonId} data-testid="comparison-contract">
                            <div className={index >= 1 ? 'my-4 border-t-2 pb-4 ' : 'my-4 pb-4'}>
                                {index >= 1 && (
                                    <button
                                        aria-label="close"
                                        data-testid="remove-contract"
                                        className="default-focus-icons float-right my-4 rounded-xl"
                                        onClick={() => handleRemoveComparison(index)}
                                    >
                                        <CancelIcon height={24} width={24} />
                                    </button>
                                )}
                                <ComparisonContract
                                    key={contract?.comparisonId}
                                    comparisonContract={contract}
                                    formConfigs={formConfig}
                                    title={formConfig?.title + ' ' + (index + 1)}
                                    onComparisonContractChange={(val: ContractComparison) => handleComparisonContractChange(val, index)}
                                    formErrors={formErrors[index] as unknown as FormValidationErrors}
                                />
                            </div>
                        </div>
                    );
                })}
            <div className=" self-center p-4">
                {allContractComparison.length <= MAX_COMPARISON && (
                    <Button
                        disabled={isComparisonLimitReached || isFormStateReadOnly}
                        variant={isComparisonLimitReached || isFormStateReadOnly ? ButtonVariant?.Inactive : ButtonVariant?.Default}
                        className="mr-4"
                        onClick={handleAddNewComparison}
                        size={ButtonSize?.Small}
                        type={ButtonType?.Primary}
                    >
                        {t('contractComparison.addNewComparison')}
                    </Button>
                )}
                {allContractComparison?.length > LAST_COMPARISON && (
                    <div className="mx-3 my-1 text-sm font-[600]">
                        <p> {t('contractComparison.comparisonWarning')}</p>
                    </div>
                )}
            </div>
            <div className="content-divider"></div>
        </div>
    );
};

export default CreateDisclosure;
