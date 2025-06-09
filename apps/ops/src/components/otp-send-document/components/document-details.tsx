import { IconType, Icon } from '@zinnia/bloom/components';
import { clsx } from 'clsx';
import { useTranslation } from 'next-i18next';
import { useRef } from 'react';

import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { useSendDocument } from '@deps/contexts/SendDocumentContext';
import { FormDetails, SendDocumentAction } from '@deps/models/case/send-document';

type DocumentDetailsProps = {
    document: FormDetails;
    isSelected: boolean;
};
const DocumentDetail = ({ document, isSelected }: DocumentDetailsProps) => {
    const { t } = useTranslation();
    const { state, dispatch } = useSendDocument();
    const inputRef = useRef<HTMLInputElement>(null);

    const { formId, formShortName, formNumber } = document;

    // this removes focus state on mouse click, but allows it on arrow key navigation
    const handleClick = (e: React.MouseEvent<HTMLLabelElement, MouseEvent>) => {
        const isNotArrowKeyEvent = e.clientX !== 0 && e.clientY !== 0;
        if (e.type === 'click' && isNotArrowKeyEvent && inputRef.current) inputRef.current.blur();
    };

    return (
        <label
            className={clsx(
                'default-focus-within my-2 flex max-w-md cursor-pointer items-center gap-2 rounded border-2 border-gray-100 bg-white p-2 hover:border-accent1',
                {
                    'border-primary': isSelected,
                }
            )}
            onClick={e => handleClick(e)}
        >
            <input
                id={formNumber}
                checked={isSelected}
                className="sr-only"
                name="case-documents"
                type="radio"
                onChange={() => {
                    dispatch({
                        type: SendDocumentAction.Documents,
                        payload: { ...state.document, selected: document },
                    });
                }}
                value={formNumber}
                ref={inputRef}
            />
            <Icon width={20} height={20} type={IconType.DOCUMENT_TEXT} />{' '}
            <div className="grow text-sm font-semibold text-secondary-dark">{formShortName}</div>
            <NavElement
                className={''}
                href={`/contact-center/document/${formId}`}
                isNewPage={false}
                size={NavElementSize.Small}
                target="_blank"
                title={`${t('sendDocument.formSelection.view')} `}
                type={NavElementType.Link}
            >
                {t('sendDocument.formSelection.view')}
            </NavElement>
        </label>
    );
};

export default DocumentDetail;
