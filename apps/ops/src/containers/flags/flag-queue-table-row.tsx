import { TableRow, TableCell, Icon, IconType } from '@zinnia/bloom/components';
import React from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';

import styles from './flag-queue.module.css';

interface FlagQueueTableRowProps {
    featureFlag: string;
}

const FlagQueueTableRow: React.FC<FlagQueueTableRowProps> = ({
    featureFlag,
}) => {
    return (
        <>
            <TableRow className={styles.row}>
                <TableCell>
                    <Content
                        details={featureFlag}
                        variant={ContentVariant.BodySm}
                    />
                </TableCell>

                <TableCell>
                    <Icon type={IconType.CIRCLE_CHECKMARK} color="green" />
                </TableCell>
            </TableRow>
        </>
    );
};

export default FlagQueueTableRow;
