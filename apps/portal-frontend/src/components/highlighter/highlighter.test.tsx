import { render } from '@testing-library/react';

import Highlighter from './highlighter';

describe('highlighter', () => {
    it('should render highlighted text with specific class', () => {
        const { getByText } = render(<Highlighter text="Hello world" highlights={['world']} />);
        const highlightedText = getByText('world');
        expect(highlightedText).toHaveClass('bg-semantic-highlight');
    });

    it('should render non-highlighted text without class', () => {
        const { getByText } = render(<Highlighter text="Hello world" highlights={['world']} />);
        const nonHighlightedText = getByText('Hello');
        expect(nonHighlightedText).not.toHaveClass('bg-semantic-highlight');
    });

    it('should render text as is when highlight is not found', () => {
        const { getByText } = render(<Highlighter text="Hello world" highlights={['foo']} />);
        const renderedText = getByText('Hello world');
        expect(renderedText).toBeInTheDocument();
    });

    it('should handle empty text', () => {
        const { container } = render(<Highlighter text="" highlights={['world']} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('should handle empty highlight', () => {
        const { getByText } = render(<Highlighter text="Hello world" highlights={['']} />);
        const renderedText = getByText('Hello world');
        expect(renderedText).toBeInTheDocument();
    });

    it('should handle highlight not found in text', () => {
        const { getByText } = render(<Highlighter text="Hello world" highlights={['foo']} />);
        const renderedText = getByText('Hello world');
        expect(renderedText).toBeInTheDocument();
    });

    it('should handle highlight for regex special characters found in text', () => {
        const { getByText } = render(<Highlighter text="***-**-5555" highlights={['***-**-5555']} />);
        const renderedText = getByText('***-**-5555');
        expect(renderedText).toBeInTheDocument();
    });

    it('should render the renderTextFunction response that should be highlighted', () => {
        const { getByText } = render(
            <Highlighter
                text="Hello world"
                highlights={['Hello world']}
                renderTextFunction={() => {
                    return 'render me';
                }}
            />
        );
        const renderedText = getByText('render me');
        expect(renderedText).toBeInTheDocument();
        expect(renderedText).toHaveClass('bg-semantic-highlight');
    });

    it('should render the renderTextFunction response with non-highlighted text', () => {
        const { getByText } = render(
            <Highlighter
                text="Hello world"
                highlights={['foo']}
                renderTextFunction={() => {
                    return 'render me';
                }}
            />
        );
        const renderedText = getByText('render me');
        expect(renderedText).toBeInTheDocument();
        expect(renderedText).not.toHaveClass('bg-semantic-highlight');
    });

    it('should render two highlighted texts with specific class', () => {
        const { getByText } = render(<Highlighter text="Hello to my world" highlights={['Hello', 'world']} />);
        const renderedText1 = getByText('Hello');
        expect(renderedText1).toBeInTheDocument();
        expect(renderedText1).toHaveClass('bg-semantic-highlight');

        const renderedText2 = getByText('world');
        expect(renderedText2).toBeInTheDocument();
        expect(renderedText2).toHaveClass('bg-semantic-highlight');
    });
});
