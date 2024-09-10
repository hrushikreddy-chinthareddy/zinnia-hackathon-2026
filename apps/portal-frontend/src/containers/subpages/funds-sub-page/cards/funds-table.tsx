import { Table, TableHeader, TableHeaderCell, TableRow, TableBody, TableCell, Icon, IconType, Loader } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { CSSProperties } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
// import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import Popover, { PopoverPlacement } from '@deps/components/popover/popover';
import { TranslationFiles } from '@deps/config/translations';
import { getBeneficiaryColor } from '@deps/containers/people-card-container/people-card-container.helper';
// import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { toSentenceCase } from '@deps/helpers/string.helper';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import styles from './funds-table.module.css';
import { FundViewModel } from '../types';
// import SideSheetFundDetails from './side-sheet-fund-details';

interface FundsTableProps {
    funds?: FundViewModel[];
    loading?: boolean;
}

const FundsTable = ({ funds, loading }: FundsTableProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.funds.fundsTable',
    });

    // TODO MG: for DEPU-2420
    // const sideSheet = useSideSheetContext();

    // const openFundDetailsSideSheet = (fund: FundViewModel) => {
    //     sideSheet.changeSideSheetContent('Fund Details', <SideSheetFundDetails fund={fund} />);
    //     sideSheet.handleOpen(true);
    // };

    if (!loading && !funds?.length) {
        return (
            <div className={styles.noFundsContainer}>
                <Icon type={IconType.DOLLAR} />
                <Content details={t('noFunds') as string} variant={ContentVariant.CaptionSelected} />
            </div>
        );
    }

    const hasSomeAllocation = funds?.some(fund => fund.allocation !== DEFAULT_ERROR_STRING);
    const hasSomeSweepDate = funds?.some(fund => fund.nextSweepDate !== DEFAULT_ERROR_STRING);

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell className={styles.nameCell}>
                        <Content details={t('fundName') as string} variant={ContentVariant.BodySmBold} />
                    </TableHeaderCell>
                    <TableHeaderCell className={styles.typeCell}>
                        <Content details={t('type') as string} variant={ContentVariant.BodySmBold} />
                    </TableHeaderCell>
                    <TableHeaderCell className={styles.interestRateCell}>
                        <div className={styles.tableHeaderContainer}>
                            <Content details={t('interestRate') as string} variant={ContentVariant.BodySmBold} />
                            <Popover
                                title={toSentenceCase(t('interestRate') as string)}
                                body={t('interestRateTooltip') as string}
                                placement={PopoverPlacement.TopRight}
                            >
                                <Icon type={IconType.CIRCLE_INFO} color="var(--color-primary-color-primary)" height={16} width={16} />
                            </Popover>
                        </div>
                    </TableHeaderCell>
                    <TableHeaderCell className={styles.valueCell}>
                        <Content details={t('fundValue') as string} variant={ContentVariant.BodySmBold} />
                    </TableHeaderCell>
                    {hasSomeAllocation && (
                        <TableHeaderCell>
                            <Content details={t('allocation') as string} variant={ContentVariant.BodySmBold} />
                        </TableHeaderCell>
                    )}
                    {hasSomeSweepDate && (
                        <TableHeaderCell>
                            <div className={styles.tableHeaderContainer}>
                                <Content details={t('nextSweepDate') as string} variant={ContentVariant.BodySmBold} />
                                <Popover
                                    title={toSentenceCase(t('nextSweepDate') as string)}
                                    body={t('nextSweepDateTooltip') as string}
                                    placement={PopoverPlacement.TopRight}
                                >
                                    <Icon type={IconType.CIRCLE_INFO} color="var(--color-primary-color-primary)" height={16} width={16} />
                                </Popover>
                            </div>
                        </TableHeaderCell>
                    )}
                    {!hasSomeAllocation && !hasSomeSweepDate && (
                        <TableHeaderCell>
                            <></>
                        </TableHeaderCell>
                    )}
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading && (
                    <TableRow>
                        <TableCell colSpan={5}>
                            <div className={styles.loaderContainer}>
                                <span className={styles.loaderIconContainer} style={{ '--loader-size': '33px' } as CSSProperties}>
                                    <Loader />
                                </span>
                            </div>
                        </TableCell>
                    </TableRow>
                )}

                {!loading && funds?.map((fund, index) => {
                    return (
                        <TableRow key={`fund-${fund.fundId}-${index}`}>
                            <TableCell className={styles.nameCell}>
                                {/* TODO MG: when do we show link? 
                                    {fund.hasSegments ? (
                                        <NavElement onClick={() => openFundDetailsSideSheet(fund) } size={NavElementSize.Small} type={NavElementType.Button}>
                                            {fund.fundName}
                                        </NavElement>
                                    ) : (
                                        <Content details={fund.fundName} variant={ContentVariant.BodySm} />
                                    )}
                                */}
                                <Content details={fund.fundName} variant={ContentVariant.BodySm} />
                            </TableCell>
                            <TableCell className={styles.typeCell}>
                                <Content details={toSentenceCase(fund.type)} variant={ContentVariant.BodySm} />
                            </TableCell>
                            <TableCell className={styles.interestRateCell}>
                                <Content details={fund.interestRate} variant={ContentVariant.BodySm} />
                            </TableCell>
                            <TableCell className={styles.valueCell}>
                                <Content details={fund.fundValue} variant={ContentVariant.BodySm} />
                            </TableCell>
                            {hasSomeAllocation && (
                                <TableCell>
                                    <div className={styles.allocationContainer}>
                                        <div
                                            className={clsx(styles.allocationSquare, getBeneficiaryColor(index))}
                                            role="presentation"
                                        ></div>
                                        <Content details={fund.allocation} variant={ContentVariant.BodySm} />
                                    </div>
                                </TableCell>
                            )}
                            {hasSomeSweepDate && (
                                <TableCell>
                                    <Content details={fund.nextSweepDate} variant={ContentVariant.BodySm} />
                                </TableCell>
                            )}
                            {!hasSomeAllocation && !hasSomeSweepDate && (
                                <TableCell>
                                    <></>
                                </TableCell>
                            )}
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};

export default FundsTable;
