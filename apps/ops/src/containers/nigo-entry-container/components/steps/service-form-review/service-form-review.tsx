import { Icon, IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import Radio from '@deps/components/radio/radio';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/documents-content';
import { TranslationFiles } from '@deps/config/translations';
import { createAction } from '@deps/containers/subpages/documents-sub-page/documents-results-table';

import { useGetPolicyTypeDocs } from './service-form-review.helper';
import { useNigoEntry } from '../../nigo-entry-provider';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';

interface SetFormReviewProps {
    policyNumber: string;
    clientCode: string;
    docType: string;
    documentNumber: string;
    activeDocType: DocumentTypeView;
}

export const ServiceFormReview = ({ policyNumber, clientCode, docType, documentNumber, activeDocType }: SetFormReviewProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'nigoEntry.serviceFormReview' });
    const { isReadyForDataEntry, setIsReadyForDataEntry } = useNigoEntry();

    const [sectionOption, setSectionOption] = useState(isReadyForDataEntry ? 'true' : 'false');
    const [loading, getPolicyDocs, workingDocument] = useGetPolicyTypeDocs(policyNumber, clientCode, docType, documentNumber);
    const sectionOptions = [
        {
            label: t('options.allSectionsAreComplete'),
            value: 'true',
        },
        {
            label: t('options.missingDetails'),
            value: 'false',
        },
    ];

    useEffect(() => {
        getPolicyDocs();
    }, []);

    const onOptionSelection = (value: string) => {
        setSectionOption(value);
        setIsReadyForDataEntry(value === 'true');
    };

    const { displayName } = workingDocument || {};

    return (
        <>
            <div className="flex flex-col">
                {!loading && workingDocument && (
                    <div className="my-3 flex w-[436px] justify-between rounded border border-gray-100 p-[12px]">
                        <div>
                            <Icon width={20} height={20} type={IconType.DOCUMENT_TEXT} />{' '}
                        </div>
                        <div>
                            <div className="text-sm font-bold"><PiiWrapper>{displayName}</PiiWrapper></div>
                            <div className="flex items-center text-sm font-normal text-gray-300">
                                <PiiWrapper>
                                    {t('documentId') + ': ' + documentNumber}
                                </PiiWrapper>
                            </div>
                        </div>
                        <div className="flex items-center">
                            {createAction(workingDocument, clientCode?.toUpperCase(), t)}
                        </div>
                    </div>
                )}
                <Radio items={sectionOptions} label={''} onChange={event => onOptionSelection(event.target.value)} value={sectionOption} />
            </div>
        </>
    );
};
