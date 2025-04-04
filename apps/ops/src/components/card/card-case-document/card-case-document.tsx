import { Tag } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useRef } from 'react';

import { CaseDocumentOption, PROCESS_WITHOUT_CASE_DOCUMENT } from '@deps/components/case-document-select/case-document-select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';

export interface CardCaseDocumentProps {
    caseDocumentOption: CaseDocumentOption;
    isSelected: boolean;
    onChange: (value: string) => void;
}

const CardCaseDocument = ({ caseDocumentOption, isSelected, onChange }: CardCaseDocumentProps) => {
    const { t } = useTranslation();

    const inputRef = useRef<HTMLInputElement>(null);

    const { documentNumber, tag, value } = caseDocumentOption;

    const isCaseDocument = value !== PROCESS_WITHOUT_CASE_DOCUMENT;

    // this removes focus state on mouse click, but allows it on arrow key navigation
    const handleClick = (e: React.MouseEvent<HTMLLabelElement, MouseEvent>) => {
        const isNotArrowKeyEvent = e.clientX !== 0 && e.clientY !== 0;
        if (e.type === 'click' && isNotArrowKeyEvent && inputRef.current) inputRef.current.blur();
    };

    return (
        <label
            className={clsx(
                'default-focus-within flex cursor-pointer flex-col gap-2 rounded border-2 border-gray-100 bg-white p-4 hover:border-accent1',
                {
                    'border-primary': isSelected,
                }
            )}
            data-testid={documentNumber}
            onClick={e => handleClick(e)}
        >
            <input
                id={value}
                checked={isSelected}
                className="sr-only"
                name="case-documents"
                type="radio"
                onChange={e => {
                    onChange(e.target.value);
                }}
                value={value}
                ref={inputRef}
            />

            {tag && <Tag text={tag} />}
            <Typography variant={TypographyVariant.BodySmBold}>
                {isCaseDocument && t('workflows.start.documentNumber')}
                <span className={clsx({ 'font-normal': isCaseDocument })}>{documentNumber}</span>
            </Typography>
        </label>
    );
};

export default CardCaseDocument;
