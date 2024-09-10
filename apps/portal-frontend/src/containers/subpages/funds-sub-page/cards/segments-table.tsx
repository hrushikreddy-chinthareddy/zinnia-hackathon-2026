import { Table, TableHeader, TableHeaderCell, TableRow, TableBody, TableCell, Icon, IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'react-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Popover, { PopoverPlacement } from '@deps/components/popover/popover';
import { TranslationFiles } from '@deps/config/translations';

import styles from './funds-table.module.css';
import { FundViewModel } from '../types';

interface SegmentsTableProps {
    fund: FundViewModel;
}

// TODO: import this where needed
const SegmentsTable = ({ fund }: SegmentsTableProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.funds.segmentsTable',
    });

    return (
        <>
            {!!fund.segments?.length && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell>
                                <div className={styles.tableHeaderContainer}>
                                    <Content details={t('segmentID') as string} variant={ContentVariant.BodySmBold} />
                                    <Popover
                                        title={t('segmentID') as string}
                                        body={t('segmentIDTooltip') as string}
                                        placement={PopoverPlacement.TopRight}
                                    >
                                        <Icon
                                            type={IconType.CIRCLE_INFO}
                                            color="var(--color-primary-color-primary)"
                                            height={16}
                                            width={16}
                                        />
                                    </Popover>
                                </div>
                            </TableHeaderCell>
                            <TableHeaderCell>
                                <div className={styles.tableHeaderContainer}>
                                    <Content details={'Start date'} variant={ContentVariant.BodySmBold} />
                                    <Popover
                                        title={t('startDate') as string}
                                        body={t('startDateTooltip') as string}
                                        placement={PopoverPlacement.TopRight}
                                    >
                                        <Icon
                                            type={IconType.CIRCLE_INFO}
                                            color="var(--color-primary-color-primary)"
                                            height={16}
                                            width={16}
                                        />
                                    </Popover>
                                </div>
                            </TableHeaderCell>
                            <TableHeaderCell>
                                <div className={styles.tableHeaderContainer}>
                                    <Content details={'End date'} variant={ContentVariant.BodySmBold} />
                                    <Popover
                                        title={t('endDate') as string}
                                        body={t('endDateTooltip') as string}
                                        placement={PopoverPlacement.TopRight}
                                    >
                                        <Icon
                                            type={IconType.CIRCLE_INFO}
                                            color="var(--color-primary-color-primary)"
                                            height={16}
                                            width={16}
                                        />
                                    </Popover>
                                </div>
                            </TableHeaderCell>
                            <TableHeaderCell>
                                <div className={styles.tableHeaderContainer}>
                                    <Content details={'Deposit amount'} variant={ContentVariant.BodySmBold} />
                                    <Popover
                                        title={t('depositAmount') as string}
                                        body={t('depositAmountTooltip') as string}
                                        placement={PopoverPlacement.TopRight}
                                    >
                                        <Icon
                                            type={IconType.CIRCLE_INFO}
                                            color="var(--color-primary-color-primary)"
                                            height={16}
                                            width={16}
                                        />
                                    </Popover>
                                </div>
                            </TableHeaderCell>
                            <TableHeaderCell>
                                <div className={styles.tableHeaderContainer}>
                                    <Content details={'Segment Cap'} variant={ContentVariant.BodySmBold} />
                                    <Popover
                                        title={t('segmentCap') as string}
                                        body={t('segmentCapTooltip') as string}
                                        placement={PopoverPlacement.TopRight}
                                    >
                                        <Icon
                                            type={IconType.CIRCLE_INFO}
                                            color="var(--color-primary-color-primary)"
                                            height={16}
                                            width={16}
                                        />
                                    </Popover>
                                </div>
                            </TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fund.segments.map((segment, index) => {
                            return (
                                <TableRow key={`fund-segment-${segment.id}-${index}`}>
                                    <TableCell>
                                        <Content details={segment.id} variant={ContentVariant.BodySm} />
                                    </TableCell>
                                    <TableCell>
                                        <Content details={segment.startDate} variant={ContentVariant.BodySm} />
                                    </TableCell>
                                    <TableCell>
                                        <Content details={segment.endDate} variant={ContentVariant.BodySm} />
                                    </TableCell>
                                    <TableCell>
                                        <Content details={segment.depositAmount} variant={ContentVariant.BodySm} />
                                    </TableCell>
                                    <TableCell>
                                        <Content details={segment.capRate} variant={ContentVariant.BodySm} />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            )}
        </>
    );
};

export default SegmentsTable;
