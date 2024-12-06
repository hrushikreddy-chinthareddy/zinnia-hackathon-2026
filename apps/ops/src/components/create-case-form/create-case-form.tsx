import { useTranslation } from 'next-i18next';
import xss from 'xss';

import Button, { ButtonSize, ButtonType } from '@deps/components/button/button';
import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';
import { CaseType } from '@deps/models/case/case';
import { getCarrierNameByClientId } from '@deps/utils/carriers';

import { searchByLabels, SearchKeys } from './create-case-form.helper';
import ButtonGroup from '../button-group/button-group';

interface CreateCaseViewProps {
    caseType: CaseType;
    clientIds: string[];
    clientId: string;
    onClientChange: (clientId: string) => void;
    documentNumber: string;
    setDocumentNumber: React.Dispatch<React.SetStateAction<string>>;
    createCase: () => Promise<void>;
    errorMessage: string;
    shouldShowReg60Case: boolean;
    onCaseTypeChange: (caseType: CaseType) => void;
    policyNumber: string;
    setPolicyNumber: React.Dispatch<React.SetStateAction<string>>;
    searchByOption: string;
    setSearchByOption: React.Dispatch<React.SetStateAction<SearchKeys>>;
}

const CreateCaseForm = ({
    clientIds,
    caseType,
    onClientChange,
    clientId,
    setDocumentNumber,
    documentNumber,
    createCase,
    errorMessage,
    shouldShowReg60Case,
    onCaseTypeChange,
    policyNumber,
    setPolicyNumber,
    searchByOption,
    setSearchByOption,
}: CreateCaseViewProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const isNewLayout = caseType === CaseType.AddressChange || caseType === CaseType.ReReg;

    const setSearchBy = (value: string, searchKey: SearchKeys) => {
        if (searchKey === SearchKeys.PolicyNumber) {
            setPolicyNumber(value);
            setDocumentNumber('');
        } else {
            setDocumentNumber(value);
            setPolicyNumber('');
        }
    };

    return (
        <>
            <div className="rounded bg-white p-4 shadow-sm">
                <div className={`flex w-full gap-4 self-center  ${isNewLayout ? 'flex-col' : ''}`}>
                    <div className="flex gap-4 self-center xs:flex-col lg:flex-row">
                        <SelectSimple
                            name={'case-type-select'}
                            label={t('caseRenewal.caseCreate.caseType') as string}
                            className={isNewLayout ? 'md:min-w-[333px]' : 'md:min-w-[250px]'}
                            onChange={value => onCaseTypeChange(value as CaseType)}
                            options={[
                                ...(shouldShowReg60Case ? [{ label: t('caseRenewal.caseCreate.reg60'), value: CaseType.Reg60 }] : []),
                                { label: t('caseRenewal.caseCreate.oft'), value: CaseType.Oft },
                                { label: t('caseRenewal.caseCreate.renewal'), value: CaseType.Renewal },
                                { label: t('caseRenewal.caseCreate.rmd'), value: CaseType.Rmd },
                                { label: t('caseRenewal.caseCreate.withdrawal'), value: CaseType.Withdrawal },
                                { label: t('caseRenewal.caseCreate.ssw'), value: CaseType.SSW },
                                { label: t('caseRenewal.caseCreate.addressChange'), value: CaseType.AddressChange },
                                { label: t('caseRenewal.caseCreate.reReg'), value: CaseType.ReReg },
                            ]}
                            placeholder={t('caseRenewal.caseCreate.caseTypePlaceholder') as string}
                            size={FieldSize.Small}
                            value={caseType}
                        />
                        <SelectSimple
                            disabled={clientIds.length < 2}
                            onChange={onClientChange}
                            className="md:min-w-[250px]"
                            label={t('caseRenewal.caseCreate.client') as string}
                            options={clientIds.map(cId => {
                                return { label: `${getCarrierNameByClientId(cId) || cId}`, value: cId.toLowerCase() };
                            }).sort((a, b) => a.label.localeCompare(b.label))}
                            
                            placeholder={t('caseRenewal.caseCreate.selectAClient') as string}
                            size={FieldSize.Small}
                            value={clientId}
                            variant={clientIds.length < 2 ? FieldVariant.Inactive : FieldVariant.Default}
                        />
                        {!isNewLayout && (
                            <Field
                                label={t('caseRenewal.caseCreate.documentId') as string}
                                className="md:min-w-[300px]"
                                onChange={event => setSearchBy(xss(event.target.value), SearchKeys.DocumentNumber)}
                                placeholder={t('caseRenewal.caseCreate.documentIdPlaceholder') as string}
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={documentNumber}
                            />
                        )}
                    </div>
                    <div className="flex gap-4 self-center ">
                        {isNewLayout && (
                            <div className="flex gap-4">
                                <ButtonGroup
                                    activeValue={searchByOption}
                                    toggle={value => setSearchByOption(value as SearchKeys)}
                                    labels={searchByLabels(t)}
                                    groupLabel={t('dashboard.search.searchKeyType')}
                                />
                                {searchByOption === SearchKeys.DocumentNumber ? (
                                    <Field
                                        label={t('caseRenewal.caseCreate.documentId') as string}
                                        className={`${isNewLayout ? 'mt-1 md:min-w-[247px]' : 'md:min-w-[200px]'}`}
                                        onChange={event => setSearchBy(xss(event.target.value), SearchKeys.DocumentNumber)}
                                        placeholder={t('caseRenewal.caseCreate.documentIdPlaceholder') as string}
                                        size={FieldSize.Small}
                                        type={FieldType.BaseActive}
                                        value={documentNumber}
                                    />
                                ) : (
                                    <Field
                                        label={t('caseRenewal.caseCreate.policyNumber') as string}
                                        className={`${isNewLayout ? 'mt-1 md:min-w-[247px]' : 'md:min-w-[200px]'}`}
                                        onChange={event => setSearchBy(xss(event.target.value), SearchKeys.PolicyNumber)}
                                        placeholder={t('caseRenewal.caseCreate.policyNumberPlaceholder') as string}
                                        size={FieldSize.Small}
                                        type={FieldType.BaseActive}
                                        value={policyNumber}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                    <div className="xs:self-center">
                        <Button
                            aria-label={t('caseRenewal.caseCreate.createAriaLabel') as string}
                            className="mt-7"
                            data-testid="create-case-search-button"
                            onClick={createCase}
                            size={ButtonSize.Small}
                            type={ButtonType.Primary}
                        >
                            {caseType === CaseType.Renewal ? t('caseRenewal.caseCreate.create') : t('caseRenewal.caseCreate.search')}
                        </Button>
                    </div>
                </div>
                <div>
                    {errorMessage && (
                        <div className="mt-4 sm:text-center lg:text-center">
                            <p className="self-center text-semantic-error">{errorMessage}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CreateCaseForm;
