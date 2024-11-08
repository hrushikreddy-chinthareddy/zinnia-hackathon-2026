import clsx from 'clsx';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import React, { useRef } from 'react';

import ClickWrapper from '@deps/components/click-container/click-wrapper';
import Content, { ContentVariant } from '@deps/components/content/content';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { useOutsideClick } from '@deps/hooks/useOutsideClick';
import { Transaction } from '@deps/models/case/withdrawal/case';
import { ReactComponent as ArrowMd } from '@deps/styles/elements/icons/arrow/arrow-md.svg';
import { ReactComponent as CopyIcon } from '@deps/styles/elements/icons/content/copy-clipboard.svg';
import { DEFAULT_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import TransactionHistoryComponent from './transaction-history';

export interface WithdrawalDrawerProps {
    content: SidebarContent;
    isNavDrawerOpen: boolean;
    setIsOpenOverride: (isOpen: boolean) => void;
    shouldOverlay: boolean;
}

export interface SidebarContent {
    transactions?: Transaction[];
    contractId: string;
    qualType?: string;
    contractStatusCode?: string;
    issueDate?: string;
    documentNumber: string;
    caseId: string;
    ownerName?: string;
    annuitantName?: string;
}

const OpenStatusRow = ({ transactions, contractId, documentNumber, caseId, qualType, issueDate, ownerName, annuitantName ,contractStatusCode}: SidebarContent) => {
    const { t } = useTranslation();
    const BASE_TRANSLATION_KEY = 'caseWithdrawal.sidebar.';
    const classes = clsx('text-white');
    return (
        <div className="w-full" data-testid="open-status-row">
            <div className={classes}>
                <div className="my-4">
                    <Typography variant={TypographyVariant.LabelMd}>{t(`${BASE_TRANSLATION_KEY}contractId`)}</Typography>
                    <div className="flex items-center gap-1">
                        <Content details={contractId || 'N/A'} variant={ContentVariant.Value} />
                        {contractId && <ClickWrapper
                            ariaLabel={t(`${BASE_TRANSLATION_KEY}copyToClipboard`, { item: t(`${BASE_TRANSLATION_KEY}contractId`) })}
                            classes="mb-1"
                            onClick={() => navigator.clipboard.writeText(contractId)}
                        >
                            <CopyIcon height={22} width={22} />
                        </ClickWrapper>}
                    </div>
                </div>

                {
                    contractStatusCode && (
                        <div className="my-4">
                            <Typography variant={TypographyVariant.LabelMd}>
                                {t(`${BASE_TRANSLATION_KEY}contractStatusCode`)}
                            </Typography>
                            <div className="flex items-center gap-1">
                                <Content details={contractStatusCode} variant={ContentVariant.Value} />
                                <ClickWrapper
                                    ariaLabel={t(`${BASE_TRANSLATION_KEY}copyToClipboard`, {
                                        item: t(`${BASE_TRANSLATION_KEY}contractStatusCode`)
                                    })}
                                    classes="mb-1"
                                    onClick={() => navigator.clipboard.writeText(contractStatusCode)}
                                >
                                    <CopyIcon height={22} width={22} />
                                </ClickWrapper>
                            </div>
                        </div>
                    )
                }

                {qualType && (
                    <div className="my-4">
                        <Typography variant={TypographyVariant.LabelMd}>{t(`${BASE_TRANSLATION_KEY}qualType`)}</Typography>
                        <div className="flex items-center gap-1">
                            <Content details={qualType} variant={ContentVariant.Value} />
                            <ClickWrapper
                                ariaLabel={t(`${BASE_TRANSLATION_KEY}copyToClipboard`, { item: t(`${BASE_TRANSLATION_KEY}qualType`) })}
                                classes="mb-1"
                                onClick={() => navigator.clipboard.writeText(qualType)}
                            >
                                <CopyIcon height={22} width={22} />
                            </ClickWrapper>
                        </div>
                    </div>
                )}

                <div className="my-4">
                    <Typography variant={TypographyVariant.LabelMd}>{t(`${BASE_TRANSLATION_KEY}documentNumber`)}</Typography>
                    <div className="flex items-center gap-1">
                        <Content details={documentNumber} truncate={true} variant={ContentVariant.Value} />
                        <ClickWrapper
                            ariaLabel={t(`${BASE_TRANSLATION_KEY}copyToClipboard`, { item: t(`${BASE_TRANSLATION_KEY}documentNumber`) })}
                            classes="mb-1"
                            onClick={() => navigator.clipboard.writeText(documentNumber)}
                        >
                            <CopyIcon height={22} width={22} />
                        </ClickWrapper>
                    </div>
                </div>
                <div className="my-4">
                    <Typography variant={TypographyVariant.LabelMd}>{t(`${BASE_TRANSLATION_KEY}caseId`)}</Typography>
                    <div className="flex items-center gap-1">
                        <Content details={caseId} variant={ContentVariant.Value} />
                        <ClickWrapper
                            ariaLabel={t(`${BASE_TRANSLATION_KEY}copyToClipboard`, { item: t(`${BASE_TRANSLATION_KEY}caseId`) })}
                            classes="mb-1"
                            onClick={() => navigator.clipboard.writeText(caseId)}
                        >
                            <CopyIcon height={22} width={22} />
                        </ClickWrapper>
                    </div>
                </div>

                {issueDate && (
                    <div className="my-4">
                        <Typography variant={TypographyVariant.LabelMd}>{t(`${BASE_TRANSLATION_KEY}issueDate`)}</Typography>
                        <div className="flex items-center gap-1">
                            <Content
                                details={dayjs(issueDate, ZAHARA_API_DATE_FORMAT).format(DEFAULT_DATE_FORMAT)}
                                variant={ContentVariant.Value}
                            />
                            <ClickWrapper
                                ariaLabel={t(`${BASE_TRANSLATION_KEY}copyToClipboard`, { item: t(`${BASE_TRANSLATION_KEY}issueDate`) })}
                                classes="mb-1"
                                onClick={() =>
                                    navigator.clipboard.writeText(dayjs(issueDate, ZAHARA_API_DATE_FORMAT).format(DEFAULT_DATE_FORMAT))
                                }
                            >
                                <CopyIcon height={22} width={22} />
                            </ClickWrapper>
                        </div>
                    </div>
                )}

                {ownerName && (
                    <div className="my-4">
                        <Typography variant={TypographyVariant.LabelMd}>{t(`${BASE_TRANSLATION_KEY}ownerName`)}</Typography>
                        <div className="flex items-center gap-1">
                            <Content details={ownerName} variant={ContentVariant.Value} />
                            <ClickWrapper
                                ariaLabel={t(`${BASE_TRANSLATION_KEY}copyToClipboard`, { item: t(`${BASE_TRANSLATION_KEY}ownerName`) })}
                                classes="mb-1"
                                onClick={() => navigator.clipboard.writeText(ownerName)}
                            >
                                <CopyIcon height={22} width={22} />
                            </ClickWrapper>
                        </div>
                    </div>
                )}

                {annuitantName && (
                    <div className="my-4">
                        <Typography variant={TypographyVariant.LabelMd}>{t(`${BASE_TRANSLATION_KEY}annuitantName`)}</Typography>
                        <div className="flex items-center gap-1">
                            <Content details={annuitantName} variant={ContentVariant.Value} />
                            <ClickWrapper
                                ariaLabel={t(`${BASE_TRANSLATION_KEY}copyToClipboard`, { item: t(`${BASE_TRANSLATION_KEY}annuitantName`) })}
                                classes="mb-1"
                                onClick={() => navigator.clipboard.writeText(annuitantName)}
                            >
                                <CopyIcon height={22} width={22} />
                            </ClickWrapper>
                        </div>
                    </div>
                )}


                {transactions && transactions.length > 0 && <TransactionHistoryComponent transactions={transactions} />}
            </div>
        </div>
    );
};

const ClosedStatusRow: React.FC<SidebarContent> = ({ contractId, documentNumber, caseId, qualType, issueDate, ownerName, annuitantName,contractStatusCode}) => {
    const { t } = useTranslation();
    const BASE_TRANSLATION_KEY = 'caseWithdrawal.sidebar.';
    const classes = clsx('flex w-full flex-col items-center gap-4  p-1 text-white');

    return (
        <div className={classes} data-testid="close-status-row">
            <div className="flex w-full flex-col items-center">
                <Typography variant={TypographyVariant.LabelMd}>{t(`${BASE_TRANSLATION_KEY}abbreviatedContractId`)}</Typography>
                <ClickWrapper
                    ariaLabel={t(`${BASE_TRANSLATION_KEY}copyToClipboard`, { item: t(`${BASE_TRANSLATION_KEY}contractId`) })}
                    onClick={() => navigator.clipboard.writeText(contractId)}
                >
                    <CopyIcon height={30} width={30} />
                </ClickWrapper>
            </div>
            { contractStatusCode && (
                <div className="flex w-full flex-col items-center">
                    <Typography variant={TypographyVariant.LabelMd}>{t(`${BASE_TRANSLATION_KEY}abbreviatedcontractStatusCode`)}</Typography>
                    <ClickWrapper
                        ariaLabel={t(`${BASE_TRANSLATION_KEY}copyToClipboard`, { item: t(`${BASE_TRANSLATION_KEY}contractStatusCode`) })}
                        onClick={() => navigator.clipboard.writeText(contractStatusCode)}
                    >
                        <CopyIcon height={30} width={30} />
                    </ClickWrapper>
                </div>
            )}
            {qualType && (
                <div className="flex w-full flex-col items-center">
                    <Typography variant={TypographyVariant.LabelMd}>{t(`${BASE_TRANSLATION_KEY}abbreviatedQualType`)}</Typography>
                    <ClickWrapper
                        ariaLabel={t(`${BASE_TRANSLATION_KEY}copyToClipboard`, { item: t(`${BASE_TRANSLATION_KEY}qualType`) })}
                        onClick={() => navigator.clipboard.writeText(qualType)}
                    >
                        <CopyIcon height={30} width={30} />
                    </ClickWrapper>
                </div>
            )}

            <div className="flex w-full flex-col items-center">
                <Typography variant={TypographyVariant.LabelMd}>{t(`${BASE_TRANSLATION_KEY}abbreviatedDocumentNumber`)}</Typography>
                <ClickWrapper
                    ariaLabel={t(`${BASE_TRANSLATION_KEY}copyToClipboard`, { item: t(`${BASE_TRANSLATION_KEY}documentNumber`) })}
                    onClick={() => navigator.clipboard.writeText(documentNumber)}
                >
                    <CopyIcon height={30} width={30} />
                </ClickWrapper>
            </div>
            <div className="flex w-full flex-col items-center">
                <Typography variant={TypographyVariant.LabelMd}>{t(`${BASE_TRANSLATION_KEY}abbreviatedCaseId`)}</Typography>
                <ClickWrapper
                    ariaLabel={t(`${BASE_TRANSLATION_KEY}copyToClipboard`, { item: t(`${BASE_TRANSLATION_KEY}caseId`) })}
                    onClick={() => navigator.clipboard.writeText(caseId)}
                >
                    <CopyIcon height={30} width={30} />
                </ClickWrapper>
            </div>
            {issueDate && (
                <div className="flex w-full flex-col items-center">
                    <Typography variant={TypographyVariant.LabelMd}>{t(`${BASE_TRANSLATION_KEY}abbreviatedIssueDate`)}</Typography>
                    <ClickWrapper
                        ariaLabel={t(`${BASE_TRANSLATION_KEY}copyToClipboard`, { item: t(`${BASE_TRANSLATION_KEY}issueDate`) })}
                        onClick={() => navigator.clipboard.writeText(dayjs(issueDate, ZAHARA_API_DATE_FORMAT).format(DEFAULT_DATE_FORMAT))}
                    >
                        <CopyIcon height={30} width={30} />
                    </ClickWrapper>
                </div>
            )}
            {ownerName && (
                <div className="flex w-full flex-col items-center">
                    <Typography variant={TypographyVariant.LabelMd}>{t(`${BASE_TRANSLATION_KEY}abbreviatedOwnerName`)}</Typography>
                    <ClickWrapper
                        ariaLabel={t(`${BASE_TRANSLATION_KEY}copyToClipboard`, { item: t(`${BASE_TRANSLATION_KEY}ownerName`) })}
                        onClick={() => navigator.clipboard.writeText(ownerName)}
                    >
                        <CopyIcon height={30} width={30} />
                    </ClickWrapper>
                </div>
            )}
            {annuitantName && (
                <div className="flex w-full flex-col items-center">
                    <Typography variant={TypographyVariant.LabelMd}>{t(`${BASE_TRANSLATION_KEY}abbreviatedAnnuitantName`)}</Typography>
                    <ClickWrapper
                        ariaLabel={t(`${BASE_TRANSLATION_KEY}copyToClipboard`, { item: t(`${BASE_TRANSLATION_KEY}annuitantName`) })}
                        onClick={() => navigator.clipboard.writeText(annuitantName)}
                    >
                        <CopyIcon height={30} width={30} />
                    </ClickWrapper>
                </div>
            )}
        </div>
    );
};

const WithdrawalDrawer: React.FC<WithdrawalDrawerProps> = ({ content, isNavDrawerOpen, setIsOpenOverride, shouldOverlay }) => {
    const { t } = useTranslation();
    // Only close on outside click while in overlay mode and the the nav drawer is open.
    // Also called when clicking items in the nav drawer while its open and shouldOverlay is true
    const handleOverlayClose = () => {
        if (shouldOverlay && isNavDrawerOpen) {
            setIsOpenOverride(false);
        }
    };

    const containerRef = useRef<HTMLDivElement>(null);
    useOutsideClick(containerRef, isNavDrawerOpen, handleOverlayClose);

    const navbarContainerClass = clsx(
        'z-10 flex-shrink-0 flex-col overflow-visible bg-gray-900 pt-2 transition-all duration-200 ease-in-out',
        {
            'w-[350px] flex-grow p-6': isNavDrawerOpen,
            'w-[52px] pt-2': !isNavDrawerOpen,
        }
    );

    return (
        <div className={navbarContainerClass} ref={containerRef}>
            {isNavDrawerOpen ? (
                <div className="flex w-full items-center justify-end">
                    <button
                        onClick={() => setIsOpenOverride(!isNavDrawerOpen)}
                        aria-label={t('sidenav.collapse') as string}
                        className="default-focus my-4 flex items-center justify-center rounded text-white"
                    >
                        <ArrowMd width={9.6} height={8} className="simple-transition flex flex-col" />
                    </button>
                </div>
            ) : (
                <div className="flex w-full items-center justify-center">
                    <button
                        onClick={() => setIsOpenOverride(!isNavDrawerOpen)}
                        aria-label={t('sidenav.expand') as string}
                        className="default-focus mb-6 mt-2 flex h-[32px] w-[32px] items-center justify-center rounded bg-gray-800 text-white"
                    >
                        <ArrowMd width={9.6} height={8} className="simple-transition flip180" />
                    </button>
                </div>
            )}

            <div className="flex w-full items-center">
                {isNavDrawerOpen ? (
                    <OpenStatusRow
                        transactions={content.transactions}
                        contractId={content.contractId}
                        caseId={content.caseId}
                        documentNumber={content.documentNumber}
                        qualType={content?.qualType}
                        issueDate={content?.issueDate}
                        ownerName={content?.ownerName}
                        annuitantName={content?.annuitantName}
                        contractStatusCode={content?.contractStatusCode}
                    />
                ) : (
                    <ClosedStatusRow
                        contractId={content.contractId}
                        caseId={content.caseId}
                        documentNumber={content.documentNumber}
                        qualType={content?.qualType}
                        issueDate={content?.issueDate}
                        ownerName={content?.ownerName}
                        annuitantName={content?.annuitantName}
                        contractStatusCode={content?.contractStatusCode}
                    />
                )}
            </div>
        </div>
    );
};

export default WithdrawalDrawer;
