import TempNavInactive from '@deps/components/nav-element/temp-nav-inactive/temp-nav-inactive';
import Tooltip, { PopoverPlacement } from '@deps/components/tooltip/tooltip';

import styles from './card-footer-action.module.css';
import { FooterContent } from '../card-section/card-section';
export interface FooterActionPros {
    footerContent: FooterContent;
}

const FooterAction = ({ footerContent }: FooterActionPros) => {
    const { text, tempInactive, tooltip, href, isDisabled, onClick } =
        footerContent;
    const getFooterActionContent = () => {
        if (tempInactive) {
            return (
                <TempNavInactive key={`${text}-tooltip`} tooltipBody={tooltip}>
                    {text}
                </TempNavInactive>
            );
        }

        if (isDisabled) {
            const textSpan = (
                <span className={styles.footerActionText} key={`${text}-link`}>
                    {text}
                </span>
            );

            return tooltip ? (
                <Tooltip
                    placement={PopoverPlacement.TopRight}
                    body={tooltip}
                    key={`${text}-tooltip`}
                >
                    {textSpan}
                </Tooltip>
            ) : (
                textSpan
            );
        }

        return (
            <a
                href={href}
                key={`${text}-link`}
                className={styles.footerActionLink}
                data-testid={text}
                onClick={onClick}
            >
                {text}
            </a>
        );
    };

    return <span key={`${text}-wrapper`}>{getFooterActionContent()}</span>;
};

export default FooterAction;
