import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';

const enum SuggestedDocType {
    SYSTEMATIC = "SYSTEMATIC",
    STOPPAY = "STOPPAY",
    RETURN_MAIL = "RETURN MAIL",
    REREG = "REREG",
    REQUIRED_MINIMUM_DISTRIBUTION = "REQUIRED MINIMUM DISTRIBUTION",
    REDEMPTION = "REDEMPTION",
    POLICY_CHANGE = "POLICY CHANGE",
    OUTGOING_TRANSFER  = "OUTGOING TRANSFER",
};

export const DocumentIndexingInfo = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'nigoEntry.serviceFormReview.documentIndexingInfo' });
    const [documentType, setDocumentType] = useState<SuggestedDocType>();
    const [notes, setNotes] = useState<string>('');

    const documentTypeOptions = [
      { label: t('documentOptions.systematic'), value: SuggestedDocType.SYSTEMATIC },
      { label: t('documentOptions.stopPayment'), value: SuggestedDocType.STOPPAY },
      { label: t('documentOptions.returnedMail'), value: SuggestedDocType.RETURN_MAIL },
      { label: t('documentOptions.accountUpdates'), value: SuggestedDocType.REREG },
      { label: t('documentOptions.requiredMinimumDistribution'), value: SuggestedDocType.REQUIRED_MINIMUM_DISTRIBUTION },
      { label: t('documentOptions.redemption'), value: SuggestedDocType.REDEMPTION },
      { label: t('documentOptions.policyUpdates'), value: SuggestedDocType.POLICY_CHANGE },
      { label: t('documentOptions.outgoingTransfers'), value: SuggestedDocType.OUTGOING_TRANSFER }
    ];

    return (
        <>
            <SelectSimple
                label={(t('suggestedDocumentType') as string)}
                onChange={val => setDocumentType(val as SuggestedDocType)}
                options={documentTypeOptions}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                value={documentType}
            />
            <Field
                label={t('notes') as string}
                onChange={e => setNotes(e.target.value)}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                value={notes}
                variant={FieldVariant.Default}
            />
        </>
    );
}