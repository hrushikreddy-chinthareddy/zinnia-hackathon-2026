import { render } from '@testing-library/react';
import { ProductType } from '@zinnia/api-types/types/sor';

import Footnote, { FootnoteProps } from './footnote';

describe('Footnote component', () => {
    it('renders default text when productType does not have a label', () => {
        const props: FootnoteProps = {
            productMarketingName: 'TestCarrier',
            productType: '' as ProductType,
        };

        const { getByText } = render(<Footnote {...props} />);
        expect(getByText('footnote.default')).toBeInTheDocument();
    });

    it('renders default text when productMarketingName does exist', () => {
        const props: FootnoteProps = {
            productMarketingName: undefined,
            productType: 'InvalidProductType' as ProductType,
        };

        const { getByText } = render(<Footnote {...props} />);
        expect(getByText('footnote.default')).toBeInTheDocument();
    });

    it('renders translated text with carrier and productType when productType has a label', () => {
        const props: FootnoteProps = {
            productMarketingName: 'TestCarrier',
            productType: ProductType.UNIVERSALLIFE,
        };

        const { getByText } = render(<Footnote {...props} />);
        expect(getByText('footnote.withProduct')).toBeInTheDocument();
    });
});
