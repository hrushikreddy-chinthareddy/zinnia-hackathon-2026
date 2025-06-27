import { useTranslation } from 'next-i18next';

import Label, { LabelVariant } from '@deps/components/label/label';
import { FormDetails } from '@deps/models/case/send-document';

import DocumentDetail from './document-details';

type SendDocumentProps = {
    documents: FormDetails[];
    selectedFormId: number | undefined;
};

const SendDocument = ({ documents, selectedFormId }: SendDocumentProps) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'sendDocument.formSelection',
    });

    return (
        <div className="documents-grid">
            <Label
                label={t('documentsTitle')}
                variant={LabelVariant.FieldLabel}
            />
            {documents.map((document) => {
                return (
                    <DocumentDetail
                        isSelected={selectedFormId === document.formId}
                        document={document}
                        key={document.formId}
                    />
                );
            })}
        </div>
    );
};

export default SendDocument;
