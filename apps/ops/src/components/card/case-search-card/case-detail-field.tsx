import FieldData from '@deps/components/fields/field-data/field-data';
import Highlighter from '@deps/components/highlighter/highlighter';
import { PiiProps } from '@deps/components/pii/pii';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import PopoverOnTruncate from '@deps/components/popover-on-truncate/popover-on-truncate';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
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
}

const CaseDetailField = ({
    ariaLabel,
    label,
    text,
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

    return label ? (
        <FieldData label={label} sentenceCase={sentenceCase}>
            {pii ? (
                <PiiWrapper>{textToRender || DEFAULT_ERROR_STRING}</PiiWrapper>
            ) : (
                textToRender || DEFAULT_ERROR_STRING
            )}
        </FieldData>
    ) : (
        <Typography variant={TypographyVariant.BodySm} {...props}>
            {pii ? (
                <PiiWrapper>{textToRender || DEFAULT_ERROR_STRING}</PiiWrapper>
            ) : (
                textToRender || DEFAULT_ERROR_STRING
            )}
        </Typography>
    );
};

export default CaseDetailField;
