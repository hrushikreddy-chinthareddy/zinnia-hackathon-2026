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
    return (
        <span key={`${text}-wrapper`}>
            {tempInactive ? (
                <TempNavInactive key={`${text}-tooltip`} tooltipBody={tooltip}>
                    {text}
                </TempNavInactive>
            ) : isDisabled ? (
                tooltip ? (
                    <Tooltip
                        placement={PopoverPlacement.TopRight}
                        body={tooltip}
                        key={`${text}-tooltip`}
                    >
                        <span
                            className={styles.footerActionText}
                            key={`${text}-link`}
                        >
                            {text}
                        </span>
                    </Tooltip>
                ) : (
                    <span
                        className={styles.footerActionText}
                        key={`${text}-link`}
                    >
                        {text}
                    </span>
                )
            ) : (
                <a
                    href={href}
                    key={`${text}-link`}
                    className={styles.footerActionLink}
                    data-testid={text}
                    onClick={onClick}
                >
                    {text}
                </a>
            )}
        </span>
    );
};

export default FooterAction;
