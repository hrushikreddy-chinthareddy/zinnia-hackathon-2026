import { useTranslation } from 'next-i18next';
import xss from 'xss';

import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helper';

import { useNigoEntry } from '../../nigo-entry-provider';

const enum SuggestedDocType {
    SYSTEMATIC = 'SYSTEMATIC',
    STOPPAY = 'STOPPAY',
    RETURN_MAIL = 'RETURN MAIL',
    REREG = 'REREG',
    REQUIRED_MINIMUM_DISTRIBUTION = 'REQUIRED MINIMUM DISTRIBUTION',
    REDEMPTION = 'REDEMPTION',
    POLICY_CHANGE = 'POLICY CHANGE',
    OUTGOING_TRANSFER  = 'OUTGOING TRANSFER',
    OTHER = 'OTHER'
};

export const DocumentIndexingInfo = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'nigoEntry.serviceFormReview.documentIndexingInfo' });
    const { documentIndexingInfo, setDocumentIndexingInfo } = useNigoEntry();

    const documentTypeOptions = [
      { label: t('documentOptions.systematic'), value: SuggestedDocType.SYSTEMATIC },
      { label: t('documentOptions.stopPayment'), value: SuggestedDocType.STOPPAY },
      { label: t('documentOptions.returnedMail'), value: SuggestedDocType.RETURN_MAIL },
      { label: t('documentOptions.accountUpdates'), value: SuggestedDocType.REREG },
      { label: t('documentOptions.requiredMinimumDistribution'), value: SuggestedDocType.REQUIRED_MINIMUM_DISTRIBUTION },
      { label: t('documentOptions.redemption'), value: SuggestedDocType.REDEMPTION },
      { label: t('documentOptions.policyUpdates'), value: SuggestedDocType.POLICY_CHANGE },
      { label: t('documentOptions.outgoingTransfers'), value: SuggestedDocType.OUTGOING_TRANSFER },
      { label: t('documentOptions.other'), value: SuggestedDocType.OTHER }
    ];

    const setDocTypeToReindex = (documentType: SuggestedDocType) => {
        setDocumentIndexingInfo((prevValues: any) => (
            { ...prevValues, docTypeToReindex: documentType }
        ));
    };

    const setNotes = (value: string) => {
        setDocumentIndexingInfo((prevValues: any) => (
            { ...prevValues, notes: xss(value) }
        ));
    };

    return (
        <div className="mx-8 max-w-[320px]">
            <div className="mt-4">
                <SelectSimple
                    label={(t('suggestedDocumentType') as string)}
                    onChange={val => setDocTypeToReindex(val as SuggestedDocType)}
                    options={documentTypeOptions}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={documentIndexingInfo?.docTypeToReindex || ''}
                />
            </div>
            <div className="mt-4">
                <Field
                    label={t('notes') as string}
                    onChange={e => setNotes(e.target.value)}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={documentIndexingInfo?.notes || ''}
                    variant={isNullEmptyOrUndefined(documentIndexingInfo?.docTypeToReindex) ? FieldVariant.Inactive : FieldVariant.Default}
                    disabled={isNullEmptyOrUndefined(documentIndexingInfo?.docTypeToReindex)}
                    maxLength={200}
                />
            </div>
        </div>
    );
}