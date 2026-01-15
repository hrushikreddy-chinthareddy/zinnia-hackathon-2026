import { Link } from '@zinnia/bloom/components';

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
            const disableActionLabel = (
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
                    {disableActionLabel}
                </Tooltip>
            ) : (
                disableActionLabel
            );
        }

        return (
            <Link
                href={isDisabled ? '' : href}
                text={text}
                data-testid={text}
                key={`${text}-link`}
                state={isDisabled ? 'inactive' : undefined}
                onClick={onClick}
            />
        );
    };

    return <span key={`${text}-wrapper`}>{getFooterActionContent()}</span>;
};

export default FooterAction;
