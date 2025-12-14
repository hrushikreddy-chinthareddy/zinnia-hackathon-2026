import {
    Children,
    HTMLAttributeAnchorTarget,
    isValidElement,
    MutableRefObject,
    ReactElement,
    ReactNode,
    useMemo,
} from 'react';
import { useTranslation } from 'react-i18next';

export const useNavLink = () => {
    const { t } = useTranslation();

    const OPEN_IN_NEW_WINDOW_LABEL = useMemo(
        () => t('allFields.openInNewWindow'),
        [t]
    );

    const buildOpenInNewWindowLinkText = (text: string | null | undefined) => {
        if (!text) return undefined;
        return `${text} ${OPEN_IN_NEW_WINDOW_LABEL ?? ''}`;
    };

    const setAriaLabelToChildLinks = (
        ref: MutableRefObject<HTMLDivElement | null>,
        value: string | null
    ) => {
        if (!ref.current) return;

        const links = ref.current.querySelectorAll('a');
        links.forEach((link) => {
            const target = link.getAttribute('target');
            const ariaLabelValue =
                target === '_blank'
                    ? buildOpenInNewWindowLinkText(value)
                    : value;
            if (ariaLabelValue) link.setAttribute('aria-label', ariaLabelValue);
        });
    };

    const getLinkTextFromChildren = (
        target: HTMLAttributeAnchorTarget | undefined,
        children: ReactNode | ReactNode[]
    ) => {
        let linkText = transformChildrenToString(children);
        linkText = `${linkText}${
            target === '_blank' ? ` ${OPEN_IN_NEW_WINDOW_LABEL ?? ''}` : ''
        }`;
        if (!linkText) return undefined;

        return linkText;
    };

    const transformChildrenToString = (
        children: ReactNode | ReactNode[]
    ): string => {
        if (!Array.isArray(children) && !isValidElement(children)) {
            return childToString(children);
        }

        return Children.toArray(children).reduce(
            (text: string, child: ReactNode): string => {
                let newText = '';

                if (hasChildren(child)) {
                    newText = transformChildrenToString(child.props.children);
                } else if (isValidElement(child)) {
                    newText = '';
                } else {
                    newText = childToString(child);
                }

                return text.concat(newText);
            },
            ''
        );
    };

    const childToString = (child?: ReactNode): string => {
        if (
            child == null ||
            typeof child === 'boolean' ||
            (typeof child === 'object' && !Object.keys(child).length)
        ) {
            return '';
        }

        if (JSON.stringify(child) === '{}') {
            return '';
        }

        return child.toString();
    };

    const hasChildren = (
        element: ReactNode
    ): element is ReactElement<{ children: ReactNode | ReactNode[] }> =>
        isValidElement<{ children?: ReactNode[] }>(element) &&
        Boolean(element.props.children);

    return {
        getLinkTextFromChildren,
        buildOpenInNewWindowLinkText,
        transformChildrenToString,
        setAriaLabelToChildLinks,
    };
};

export default useNavLink;
