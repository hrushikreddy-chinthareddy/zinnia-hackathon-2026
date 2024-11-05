import FieldData from "@deps/components/fields/field-data/field-data";
import Highlighter from "@deps/components/highlighter/highlighter";
import { PiiProps } from "@deps/components/pii/pii";
import { PiiWrapper } from "@deps/components/pii/PiiWrapper";
import PopoverOnTruncate from "@deps/components/popover-on-truncate/popover-on-truncate";
import { DEFAULT_ERROR_STRING } from "@deps/types/constants";

interface CaseDetailFieldProps extends PiiProps {
    label: string;
    text?: string | null;
    sentenceCase?: boolean;
    truncate?: boolean;
    highlights?: string[] | null;
}

const CaseDetailField = ({ label, text, highlights, sentenceCase = true, truncate = false, pii = false }: CaseDetailFieldProps) => {
    const textWithHighlights = !!text && highlights && highlights.length ? <Highlighter text={text} highlights={highlights} /> : text;

    const textToRender =
        truncate && !!text ? (
            <PopoverOnTruncate title={text}>
                <span className="line-clamp-1 break-all font-secondary text-md">{textWithHighlights}</span>
            </PopoverOnTruncate>
        ) : (
            textWithHighlights
        );

    return (
        <FieldData label={label} sentenceCase={sentenceCase}>
            {pii ? <PiiWrapper>{textToRender || DEFAULT_ERROR_STRING}</PiiWrapper> : textToRender || DEFAULT_ERROR_STRING}
        </FieldData>
    );
};

export default CaseDetailField;
