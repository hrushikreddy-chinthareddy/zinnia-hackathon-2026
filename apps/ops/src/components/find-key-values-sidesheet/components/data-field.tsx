import { Icon, IconType, Link, Popover } from '@zinnia/bloom/components';
import { useState } from 'react';

import DotContainer from '@deps/components/dot-container/dot-container';
import Highlighter from '@deps/components/highlighter/highlighter';

import styles from '../find-all-key-values-sidesheet.module.css';

/**
 * A component that renders a data field with a label and value.
 * The label is highlighted if it matches the search value.
 * The value is a link if a link is provided.
 *
 * @param dataField - The data field to render as [label, value]
 * @param link - The link for the value
 * @param searchValue - The search value to highlight in the label
 */
export const DataField = ({
    dataField,
    link,
    toolTip,
    searchValue,
}: {
    dataField: [string, string];
    link?: string;
    toolTip?: string;
    searchValue: string;
}) => {
    const [fieldLabel, fieldData] = dataField;
    const [popoverContainer, setPopoverContainer] =
        useState<HTMLDivElement | null>(null);

    return (
        <DotContainer
            dotLeftSide={
                <div ref={setPopoverContainer} className={styles.fieldLabel}>
                    <Highlighter text={fieldLabel} highlights={[searchValue]} />
                    {toolTip && (
                        <Popover
                            container={popoverContainer}
                            title={fieldLabel}
                            trigger={
                                <Icon
                                    type={IconType.CIRCLE_INFO}
                                    color="var(--color-base-icon-icon-tooltip)"
                                    small
                                    className={styles.toolTipIcon}
                                />
                            }
                        >
                            <div className="typography-content-body-sm">
                                {toolTip}
                            </div>
                        </Popover>
                    )}
                </div>
            }
            dotLeftSideClassName="typography-content-body-sm"
            dotRightSide={
                link ? (
                    <Link href={link} text={fieldData} />
                ) : (
                    <Highlighter text={fieldData} highlights={[searchValue]} />
                )
            }
            dotRightSideClassName="typography-content-body-sm"
        />
    );
};
