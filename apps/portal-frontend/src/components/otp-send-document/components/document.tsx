import { useTranslation } from 'next-i18next';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { useSendDocument } from '@deps/contexts/SendDocumentContext';
import { FormDetails } from '@deps/models/case/send-document';

import DocumentDetail from './document-details';

type SendDocumentProps = {
    documents: FormDetails[];
};

const SendDocument = ({ documents }: SendDocumentProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sendDocument.formSelection' });
    const { state } = useSendDocument();
    const formId = state?.document?.selected?.formId || '';
    return (
        <div className="documents-grid">
            <Typography variant={TypographyVariant.Label} className="mb-4">
                {t(`documentsTitle`)}
            </Typography>

            {documents.map(document => {
                return <DocumentDetail isSelected={formId === document.formId} document={document} key={document.formId} />;
            })}
        </div>
    );
};

export default SendDocument;
