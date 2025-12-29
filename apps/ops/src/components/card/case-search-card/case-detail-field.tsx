import { useTranslation } from 'react-i18next';

import FieldData from '@deps/components/fields/field-data/field-data';
import Highlighter from '@deps/components/highlighter/highlighter';
import { PiiProps } from '@deps/components/pii/pii';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { PopoverPlacement } from '@deps/components/popover/popover';
import PopoverOnTruncate from '@deps/components/popover-on-truncate/popover-on-truncate';
import Tooltip from '@deps/components/tooltip/tooltip';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { ReactComponent as Warning } from '@deps/styles/elements/icons/alert/warning.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
interface CaseDetailFieldProps extends PiiProps {
    ariaLabel?: string;
    label?: string | null;
    text?: string | null;
    sentenceCase?: boolean;
    truncate?: boolean;
    highlights?: string[] | null;
    popoverClassName?: string;
    triggerClassName?: string;
    escalated?: boolean;
}

const CaseDetailField = ({
    ariaLabel,
    label,
    text,
    escalated,
    highlights,
    sentenceCase = true,
    truncate = false,
    pii = false,
    popoverClassName,
    triggerClassName,
    ...props
}: CaseDetailFieldProps) => {
    const textWithHighlights =
        !!text && highlights && highlights.length ? (
            <Highlighter text={text} highlights={highlights} />
        ) : (
            text
        );

    const textToRender =
        truncate && !!text ? (
            <PopoverOnTruncate
                title={text}
                triggerClassName={triggerClassName}
                popoverClassName={popoverClassName}
            >
                <span
                    aria-label={ariaLabel}
                    className="line-clamp-1 break-all font-secondary text-md"
                >
                    {textWithHighlights}
                </span>
            </PopoverOnTruncate>
        ) : (
            textWithHighlights
        );
    const { t } = useTranslation();
    return label ? (
        <FieldData label={label} sentenceCase={sentenceCase}>
            {pii ? (
                <PiiWrapper>{textToRender || DEFAULT_ERROR_STRING}</PiiWrapper>
            ) : (
                textToRender || DEFAULT_ERROR_STRING
            )}
        </FieldData>
    ) : (
        <Typography
            variant={TypographyVariant.BodySm}
            {...props}
            className="flex items-center"
        >
            {pii ? (
                <PiiWrapper>{textToRender || DEFAULT_ERROR_STRING}</PiiWrapper>
            ) : (
                textToRender || DEFAULT_ERROR_STRING
            )}
            {escalated && (
                <Tooltip
                    placement={PopoverPlacement.TopRight}
                    body={t('taskManagementQueue.prioritized')}
                    isTabbable={false}
                >
                    <Warning height={16} width={16} className="ml-1" />
                </Tooltip>
            )}
        </Typography>
    );
};

export default CaseDetailField;
