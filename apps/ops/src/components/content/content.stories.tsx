import { Meta } from '@storybook/react';

import Content, { ContentVariant } from '@deps/components/content/content';

export default {
    title: 'Components/Content',
    component: Content,
    decorators: [
        (Story) => (
            <div className="container">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof Content>;

export const ContentComponent = () => {
    return (
        <div className="flex flex-col gap-5">
            <Content
                details="Body content, Lato Regular 16px/24px"
                variant={ContentVariant.Body}
            />
            <Content
                details="Body-sm content, Lato Regular 14px/22px"
                variant={ContentVariant.BodySm}
            />
            <Content
                details="Body-bold content, Lato Regular 16px/24px"
                variant={ContentVariant.BodyBold}
            />
            <Content
                details="Body-sm-bold content, Lato Regular 14px/22px"
                variant={ContentVariant.BodySmBold}
            />
            <Content
                details="Body-paragraph content, Lato Regular 16px/28px"
                variant={ContentVariant.BodyParagraph}
            />
            <Content
                details="List-item content, Lato Regular 16px/24px"
                variant={ContentVariant.ListItem}
            />
            <Content
                details="Footer-legal content, Lato Regular 12px/18px"
                variant={ContentVariant.FooterLegal}
            />
        </div>
    );
};
