import { escapeRegExp } from '@deps/helpers/string.helpers';

interface HighlighterProps {
    text?: string;
    highlights: string[];
    renderTextFunction?: (text: string) => string | JSX.Element[];
}

const highlightText = ({
    text,
    highlights,
    renderTextFunction = (text) => text,
}: HighlighterProps) => {
    // lowercase items in the highlights array
    highlights = highlights.map((v) => v.toLowerCase());

    // need a separate escaped array so the regex works correctly and so we can still match on the orginal values.
    const escaped = highlights.map((v) => escapeRegExp(v));

    // the .filter(Boolean) filters out empty string the regex returns for whole string matches ['', 'Hello world', '']
    const parts = text
        ?.split(new RegExp(`(${escaped.join('|')})`, 'gi'))
        .filter(Boolean);

    return parts?.map((part, index) => {
        return highlights.includes(part.toLowerCase()) ? (
            <span key={index} className="bg-semantic-highlight">
                {renderTextFunction(part)}
            </span>
        ) : (
            <span key={index}>{renderTextFunction(part)}</span>
        );
    });
};

const Highlighter = ({
    text,
    highlights,
    renderTextFunction = (text: string) => text,
}: HighlighterProps) => {
    if (!text) {
        return <></>;
    }

    if (!highlights || !highlights.length) {
        return <>{renderTextFunction(text)}</>;
    }

    // filter out empty strings from the highlight array
    highlights = highlights.filter(Boolean);

    if (!highlights || !highlights.length) {
        return <>{renderTextFunction(text)}</>;
    }

    return <>{highlightText({ text, highlights, renderTextFunction })}</>;
};

export default Highlighter;
