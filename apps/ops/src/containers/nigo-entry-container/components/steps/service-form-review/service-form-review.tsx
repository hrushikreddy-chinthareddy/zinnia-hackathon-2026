import { Icon, IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';

import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Radio from '@deps/components/radio/radio';
import { TranslationFiles } from '@deps/config/translations';
import { createAction } from '@deps/containers/subpages/documents-sub-page/documents-results-table';

import { DocumentIndexingInfo } from './document-indexing-info';
import { NigoOptionDetails } from './nigo-option-details';
import { useGetPolicyTypeDocs } from './service-form-review.helper';
import { useNigoEntry } from '../../nigo-entry-provider';

export enum SelOptionType {
    DATA_ENTRY = "DATA_ENTRY",
    NIGO_ENTRY = "NIGO_ENTRY",
    DOC_INDEXING = "DOC_INDEXING",
};

interface SetFormReviewProps {
    policyNumber: string;
    clientCode: string;
    docType: string;
    documentNumber: string;
    nigoExpection: any;
    nigoSubExceptions: any;
};

export const ServiceFormReview = ({ policyNumber, clientCode, docType, documentNumber, nigoExpection, nigoSubExceptions }: SetFormReviewProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'nigoEntry.serviceFormReview' });
    const NIGO_EXCEPTION: SelOptionType = nigoExpection?.value;
    const { sectionOption, setSectionOption, setExceptions } = useNigoEntry();
    const [loading, getPolicyDocs, workingDocument] = useGetPolicyTypeDocs(policyNumber, clientCode, docType, documentNumber);
    const { displayName } = workingDocument || {};

    const sectionOptions = [
        {
            label: t('options.allSectionsAreComplete'),
            value: SelOptionType.DATA_ENTRY
        },
        {
            label: t('options.missingDetails'),
            value:  SelOptionType.NIGO_ENTRY
        },
        {
            label: t('options.incorrectDocIndexing'),
            value: SelOptionType.DOC_INDEXING
        }
    ];

    if (nigoExpection) {

        sectionOptions.push(
            {
                label: nigoExpection.label,
                value: nigoExpection.value
            }
        );
    }

    useEffect(() => {
        getPolicyDocs();
    }, []);

    const onOptionSelection = (value: SelOptionType) => {
        setSectionOption(value);
        if (value === NIGO_EXCEPTION) {
            setExceptions(prevState => {
                let newState = [];
                newState = [...prevState, value];
                return newState;
            });
        } else {
            setExceptions(prevState => {
                let newState = [];
                prevState.splice(prevState.indexOf(value), 1);
                newState = prevState.filter((element: any) => element !== undefined);
                return [...newState];
            });
        }
    };

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
                {!loading && !workingDocument && (
                    <div className="my-3 flex w-[436px] justify-between rounded border border-gray-100 p-[12px]">
                        <div className="text-sm font-bold">
                            <PiiWrapper>{t('noDocumentAvailable')}</PiiWrapper>
                        </div>
                    </div>
                )}
                <Radio items={sectionOptions} label={''} onChange={event => onOptionSelection(event.target.value as SelOptionType)} value={sectionOption || SelOptionType.DATA_ENTRY} />
                { sectionOption === SelOptionType.DOC_INDEXING && <DocumentIndexingInfo /> }
                { sectionOption === NIGO_EXCEPTION && <NigoOptionDetails selNigoExpetion={nigoExpection.value} nigoSubExceptions={nigoSubExceptions} nigoExpetion={NIGO_EXCEPTION} /> }
            </div>
        </>
    );
};
