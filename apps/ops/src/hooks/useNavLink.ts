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

/**
 * Custom hook to wrap logic necessary to add/set the aria-label attribute for links
 * It was build considering 3 different types of links used accross the app (NavLink, Link, BannerAlert)
 * @returns getLinkTextFromChildren: This method is used to get the text from a component and build the aria-label value with it, meant to be used in components like NavLink to build the text and use it
 * @returns buildOpenInNewWindowLinkText: This method builds the aria-label text directly, meant to be used on Link or anchors directly
 * @returns setAriaLabelToChildLinks: This method manipulates the dom and set aria-label to links inside a div, meant to be used on BannerAlert since cannot directly set the aria-label
 */
export const useNavLink = () => {
    const { t } = useTranslation();

    const OPEN_IN_NEW_WINDOW_LABEL = useMemo(
        () => t('allFields.openInNewWindow'),
        [t]
    );

    /**
     * Method that adds the "Open in new window" string to another
     * Its usage is primarily to build the strings directly for the anchors or Links that has the target _blank
     * @param text String that will be concatenated
     * @returns The parameter plus the "Open in new window" phrase
     * @example
     *  const { buildOpenInNewWindowLinkText } = useNavLink();
     *
     *  <a target='_blank' arial-label={buildOpenInNewWindowLinkText('Anchor text')>Anchor text</a>}
     */
    const buildOpenInNewWindowLinkText = (text: string | null | undefined) => {
        if (!text) return undefined;
        return `${text} ${OPEN_IN_NEW_WINDOW_LABEL ?? ''}`;
    };

    /**
     * Method to find anchors in a div element and set the aria-label attribute
     * Its used for those external components were the aria-label cannot be set since it isn't a property
     * @param ref Reference to a div element using React.useRef
     * @param value String value used to set the aria-label attribute adding the "Open in new window" if anchor target is _blank
     * @example
     *  const { setAriaLabelToChildLinks } = useNavLink();
     *  const divRef = React.useRef<HTMLDivElement | null>(null);
     *
     *  useEffect(() => {
     *      if (divRef.current) {
     *          setAriaLabelToChildLinks(divRef, t('textKey'));
     *      }
     *  }, [setAriaLabelToChildLinks, t]);
     *
     *  <div ref={divRef}>
     *      ***anchors or components that contain them***
     *  </div>
     */
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

    /**
     * Method to get the aria-label text reading it from a component.
     * It is added the "Open in new window" phrase based on the target param
     * Its used to build the text inside components like nav-link.tsx were we have to dynamically get the text
     * @param target Anchor target values, if _blank, it adds the "Open in new window"
     * @param children React elment that will be used to iterate to get the text
     * @returns The react component text with the "Open in new window" phrase if corresponds
     * @example
     *  export default function CustomLink({
     *      target,
     *      children
     *  }: CustomLinkProps) {
     *      const { getLinkTextFromChildren } = useNavLink();
     *      const newPageAnnounce = React.useRef<string | undefined>(undefined);
     *
     *      newPageAnnounce.current = getLinkTextFromChildren(target, children);
     *
     *  return <a target={target}>{children}</a>
     */
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

    /**
     * Internal method used to iterate react nodes in order to read and concatenate the text inside each node
     *
     * As a first step, if the children is no longer a valid react element, it means it is a value ready to be read
     *
     * If not, it will iterate through the component childrens a validate different scenarios
     * - If children has another children, will execute this funcion recursively into that children
     * - If is a valid component, it mean it is a html element, and we don't need to interact with them directly
     * - Else the children component is a value ready to be read
     * At the end of each iteration, the value read is concatenated
     *
     * What we seek here is the ability to go as deep as possible to get the text from a component
     *
     * @param children Starting react node that will be iterate
     * @returns Concatenated string that was found on the nodes
     * @example
     *  <div>
     *      <a>
     *          <img />
     *          <span>Text to read</span>
     *      </a>
     *  </div>
     *
     *  Text to read should be returned
     */
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
        setAriaLabelToChildLinks,
        transformChildrenToString,
    };
};

export default useNavLink;
