import {
    Children,
    HTMLAttributeAnchorTarget,
    isValidElement,
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
            typeof child === 'undefined' ||
            child === null ||
            typeof child === 'boolean'
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
    };
};

export default useNavLink;
