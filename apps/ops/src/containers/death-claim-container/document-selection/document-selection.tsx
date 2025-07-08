import {
    AssistiveText,
    AssistiveTextVariant,
    Button,
} from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import { ButtonSize } from '@deps/components/button/button';
import { PROCESS_WITHOUT_CASE_DOCUMENT } from '@deps/components/case-document-select/case-document-select';
import Radio, { RadioItem, RadioVariant } from '@deps/components/radio/radio';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useDeathClaim } from '@deps/contexts/DeathClaimContext';
import { DocumentInfo } from '@deps/hooks/useDeathClaimSupportingDocument';
import { browserLogInfo } from '@deps/utils/browser-logging';

interface DocumentSelectionProps {
    policyNumber: string;
    lob: string;
    supportingDocuments: DocumentInfo[];
    onCancel: () => void;
}

const DocumentSelection = ({
    supportingDocuments,
    policyNumber,
    lob,
    onCancel,
}: DocumentSelectionProps) => {
    const router = useRouter();
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'deathClaims.documentSelection',
    });
    const [caseOptions, setCaseOptions] = useState<RadioItem[]>([]);
    const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>(
        undefined
    );
    const [selectedDocumentNumber, setSelectedDocumentNumber] =
        useState<string>('');
    const { setOnbaseCaseId, setIsDocumentSelected, setOnbaseDocumentNumber } =
        useDeathClaim();

    useEffect(() => {
        const items = supportingDocuments?.map((document) => {
            return {
                label: document?.documentNumber,
                value: document?.caseId,
            };
        });
        browserLogInfo('DocumentSelection::Set list of supporting documents', {
            lob: lob,
            policyNumber: policyNumber,
            documentListCount: supportingDocuments?.length || 0,
            docsList: items,
        });
        const noDocumentOption = {
            label: t('proceedWithoutDocument'),
            value: PROCESS_WITHOUT_CASE_DOCUMENT,
        };
        setCaseOptions([...items, noDocumentOption]);
    }, [lob, policyNumber, supportingDocuments, t]);

    const onDocumentSelection = (selection: string) => {
        const selectedOption = caseOptions.find(
            (option) => option.value === selection
        );
        const docNumber = selectedOption
            ? selectedOption.value !== PROCESS_WITHOUT_CASE_DOCUMENT
                ? selectedOption.label
                : ''
            : '';
        setSelectedCaseId(selection);
        setSelectedDocumentNumber(docNumber);
    };

    const handleCancel = () => {
        onCancel();
        setIsDocumentSelected(false);
        setOnbaseCaseId(PROCESS_WITHOUT_CASE_DOCUMENT);
        setOnbaseDocumentNumber(PROCESS_WITHOUT_CASE_DOCUMENT);
        router.push('/policies');
    };

    const handleContinue = () => {
        if (selectedCaseId === undefined) {
            return;
        }
        setIsDocumentSelected(true);
        setOnbaseCaseId(selectedCaseId);
        setOnbaseDocumentNumber(selectedDocumentNumber);
        onCancel();
    };

    return (
        <div className="responsive-padding flex grow flex-col gap-6">
            <div className="flex flex-col gap-2">
                <div className="my-2">
                    <Typography variant={TypographyVariant.LabelLg}>
                        {t('title')}
                    </Typography>
                </div>
                <Typography variant={TypographyVariant.Body}>
                    {t('subtitle')}
                </Typography>
            </div>
            <div className="flex flex-col gap-4">
                <div className="grid auto-rows-fr grid-cols-1 gap-2">
                    <Radio
                        items={caseOptions}
                        onChange={(e) => onDocumentSelection(e.target.value)}
                        value={selectedCaseId}
                        required={true}
                        disabled={false}
                        variant={RadioVariant.Default}
                    />
                </div>
                <div className="grid auto-rows-fr grid-cols-1 gap-2">
                    {selectedCaseId === undefined && (
                        <AssistiveText
                            variant={AssistiveTextVariant.Error}
                            text={t('missingSelection')}
                        />
                    )}
                </div>
            </div>
            <div className="flex flex-col self-center p-4">
                <div className="flex gap-2">
                    <Button
                        aria-label={t('continue') as string}
                        mode="primary"
                        size={ButtonSize.Small}
                        type={'submit'}
                        onClick={handleContinue}
                        disabled={selectedCaseId === undefined}
                    >
                        {t('continue')}
                    </Button>

                    <Button
                        aria-label={t('cancel') as string}
                        mode="secondary"
                        size={ButtonSize.Small}
                        onClick={handleCancel}
                    >
                        {t('cancel')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DocumentSelection;
