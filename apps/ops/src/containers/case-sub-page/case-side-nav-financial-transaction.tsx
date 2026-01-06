import {
    AccordionContent,
    AccordionHeader,
    AccordionItem,
    Accordion as AccordionRoot,
    AccordionTrigger,
} from '@radix-ui/react-accordion';
import { Icon, IconType } from '@zinnia/bloom/components';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { renderNode } from '@deps/components/find-key-values-sidesheet/components/data-node-renderer';
import { FindAllKeyValuesFinancialTransactionSidesheet } from '@deps/components/find-key-values-sidesheet/find-all-key-values-financial-transaction';
import { getFinancialTransactions } from '@deps/components/find-key-values-sidesheet/transformations/section-grouping';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TreeStateProvider } from '@deps/hooks/useTreeState';
import { FinancialTransactionRecord } from '@deps/models/case/financial-transactions';

import styles from './styles.module.css';

export type CaseSideNavFinancialTransactionProps = {
    financialTransaction?: FinancialTransactionRecord;
    financialTransactionLoading: boolean;
};

export const CaseSideNavFinancialTransaction = ({
    financialTransaction,
    financialTransactionLoading,
}: CaseSideNavFinancialTransactionProps) => {
    const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);
    const prevActiveElement = useRef<HTMLElement | null>(null);
    const { t } = useTranslation();
    const [openSection, setOpenSection] = useState(true);

    useEffect(() => {
        // Restore focus to row on sidesheet close
        if (!isSideSheetOpen) {
            prevActiveElement.current?.focus();
        }
    }, [isSideSheetOpen]);

    const transaction = financialTransaction?.entity?.transaction ?? null;

    const transactionNodes = useMemo(() => {
        return getFinancialTransactions(transaction, t);
    }, [transaction, t]);

    return (
        <div className={styles.transactionLayoutAccordion}>
            <AccordionRoot type="single" value={'financialTransaction'}>
                <AccordionItem
                    key={'financialTransaction'}
                    value={'financialTransaction'}
                >
                    <AccordionHeader>
                        <AccordionTrigger
                            className={`${styles.transactionAccordionHeader}`}
                        >
                            {openSection === true ? (
                                <div onClick={() => setOpenSection(false)}>
                                    <Icon
                                        type={IconType.CHEVRON}
                                        height={16}
                                        width={16}
                                    />
                                </div>
                            ) : (
                                <div onClick={() => setOpenSection(true)}>
                                    <Icon
                                        type={IconType.CHEVRON_RIGHT}
                                        height={16}
                                        width={16}
                                    />
                                </div>
                            )}
                            <div className={styles.transactionSection}>
                                <Typography
                                    asTag="h2"
                                    variant={TypographyVariant.BodyBold}
                                >
                                    {t('label.transactionDetails')}
                                </Typography>

                                {financialTransaction && (
                                    <FindAllKeyValuesFinancialTransactionSidesheet
                                        financialTransaction={
                                            financialTransaction
                                        }
                                        open={isSideSheetOpen}
                                        onOpenChange={setIsSideSheetOpen}
                                    />
                                )}
                            </div>
                        </AccordionTrigger>
                    </AccordionHeader>
                    <AccordionContent>
                        {openSection && (
                            <div className={styles.transactionLayout}>
                                {financialTransactionLoading ? (
                                    <Typography
                                        variant={TypographyVariant.BodySmBold}
                                        className="flex flex-row items-center text-gray-600"
                                    >
                                        {t(
                                            'caseOverview.sidenav.gettingFinancialTransaction'
                                        )}
                                    </Typography>
                                ) : (
                                    transactionNodes?.map((node, i) => {
                                        return (
                                            <div
                                                className={styles.itemsList}
                                                key={`transactionNodes-${i}`}
                                            >
                                                <TreeStateProvider
                                                    initialTreeState={false}
                                                >
                                                    {renderNode(node, i)}
                                                </TreeStateProvider>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </AccordionRoot>
        </div>
    );
};

export default CaseSideNavFinancialTransaction;
