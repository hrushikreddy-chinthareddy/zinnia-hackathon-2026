import { render, screen, fireEvent } from '@testing-library/react';
import router from 'next/router';

import HyperLinkWidget, { HyperLink } from './hyper-link-widget';
import { widgetRegistryMock } from '../widgetMocks';

jest.mock('next/router', () => ({
    push: jest.fn(),
}));

describe('HyperLink Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'warn').mockImplementation();
    });

    it('should render link with label', () => {
        render(
            <HyperLink
                type="link"
                label="Hyper Link"
                value="https://hyper-link.com"
            />
        );
        expect(screen.getByText('Hyper Link')).toBeInTheDocument();
    });
});

describe('HyperLinkWidget Component', () => {
    it('should render a single hyperlink with type="link"', () => {
        const uiSchema = {
            'ui:options': {
                type: 'link',
            },
        };
        render(
            <HyperLinkWidget
                value="https://hyper-link.com"
                label="Hyper Link"
                uiSchema={uiSchema}
                formContext={{}}
                schema={{}}
                disabled={false}
                readonly={false}
                onChange={jest.fn()}
                onBlur={jest.fn()}
                onFocus={jest.fn()}
                id="test"
                options={{ inline: true }}
                required={false}
                rawErrors={[]}
                name={''}
                registry={widgetRegistryMock}
            />
        );
        const hyperLink = screen.getByText('Hyper Link');
        expect(hyperLink).toBeInTheDocument();
    });

    it('should render a single hyperlink that opens in the same tab', () => {
        render(
            <HyperLinkWidget
                value="https://hyper-link.com"
                label="Hyper Link"
                uiSchema={{}}
                formContext={{}}
                schema={{}}
                disabled={false}
                readonly={false}
                onChange={jest.fn()}
                onBlur={jest.fn()}
                onFocus={jest.fn()}
                id="test"
                options={{ inline: true }}
                required={false}
                rawErrors={[]}
                name={''}
                registry={widgetRegistryMock}
            />
        );
        const hyperLink = screen.getByText('Hyper Link');
        expect(hyperLink).toBeInTheDocument();

        fireEvent.click(hyperLink);
        expect(router.push).toHaveBeenCalledWith('https://hyper-link.com');
    });

    describe('when inline is true', () => {
        it('should render a single inline hyperlink with type="link"', () => {
            const uiSchema = {
                'ui:options': {
                    label: false,
                    inline: true,
                    type: 'link',
                },
            };
            render(
                <HyperLinkWidget
                    value="https://hyper-link.com"
                    label="Hyper Link"
                    uiSchema={uiSchema}
                    formContext={{}}
                    schema={{}}
                    disabled={false}
                    readonly={false}
                    onChange={jest.fn()}
                    onBlur={jest.fn()}
                    onFocus={jest.fn()}
                    id="test"
                    options={{ inline: true }}
                    required={false}
                    rawErrors={[]}
                    name={''}
                    registry={widgetRegistryMock}
                />
            );
            const hyperLinkText = screen.getAllByText('Hyper Link');
            expect(hyperLinkText).toHaveLength(2);
        });

        it('should render multiple hyperlinks when value is an array', () => {
            const schema = {
                title: 'Hyper Links',
                items: {
                    properties: {
                        urlLabel: {
                            default: '{{documentName}}',
                        },
                        urlValue: {
                            default:
                                '/documents/{{documentId}}?documentType=Case&carrierCode=WELB',
                        },
                    },
                },
            };
            const uiSchema = {
                'ui:options': {
                    inline: true,
                    label: false,
                    type: 'link',
                },
            };
            render(
                <HyperLinkWidget
                    value={[
                        {
                            documentName: 'Link 1',
                            urlLabel: '{{documentName}}',
                            urlValue:
                                '/documents/{{documentId}}?documentType=Case&carrierCode=WELB',
                        },
                        {
                            documentName: 'Link 2',
                            urlLabel: '{{documentName}}',
                            urlValue:
                                '/documents/{{documentId}}?documentType=Case&carrierCode=WELB',
                        },
                    ]}
                    label="Document"
                    uiSchema={uiSchema}
                    formContext={{}}
                    schema={schema}
                    disabled={false}
                    readonly={false}
                    onChange={jest.fn()}
                    onBlur={jest.fn()}
                    onFocus={jest.fn()}
                    id="test"
                    options={{ inline: true }}
                    required={false}
                    rawErrors={[]}
                    name={''}
                    registry={widgetRegistryMock}
                />
            );

            expect(screen.getByText('Hyper Links')).toBeInTheDocument();
            expect(screen.getByText('Link 1')).toBeInTheDocument();
            expect(screen.getByText('Link 2')).toBeInTheDocument();
        });
    });
});
