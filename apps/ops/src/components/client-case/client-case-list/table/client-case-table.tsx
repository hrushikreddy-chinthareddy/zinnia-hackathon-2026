import {
    Icon,
    IconType,
    Label,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
    Tooltip,
} from '@zinnia/bloom/components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import { useTranslation } from 'react-i18next';

import { useIllustrationAnalytics } from '@deps/components/illustrations/helpers/hooks/use-illustration-analytics';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useIllustrationsClientCase } from '@deps/contexts/illustrations/IllustrationsClientCaseContext';
import { calculateAge } from '@deps/helpers/string.helpers';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';
import { IllustrationsClientCase } from '@deps/types/illustrations';
import { ProductType, ProductTypeLabel } from '@deps/types/product';
import { formatRelativeTime } from '@deps/utils/dates';
import { DEFAULT_ERROR_STRING , capitalize } from '@deps/utils/strings';

import styles from './client-case-table.module.css';
import TableHeaderSortWrapper from './table-header-sort-wrapper.tsx/table-header-sort-wrapper';

const generateTableContent = (
    clientCases: IllustrationsClientCase[],
    t: TFunction,
    onRowClick: (url: string, clientCaseId: string) => void
) => {
    if (clientCases.length > 0) {
        return clientCases.map((caseData) => {
            const {
                id,
                title,
                agentDetails,
                insuredDetails,
                lastModified,
                illustrationsCount,
                productTypes,
                agencyName,
            } = caseData;
            const clientCaseTitle = title || DEFAULT_ERROR_STRING;

            const insuredName =
                `${insuredDetails?.firstName || ''} ${
                    insuredDetails?.lastName || ''
                }`.trim() || DEFAULT_ERROR_STRING;
            const insuredDetailsLine = [
                capitalize(insuredDetails?.sexAtBirth),
                calculateAge(insuredDetails?.dateOfBirth?.toString(), ''),
                insuredDetails?.state,
            ]
                .filter(Boolean)
                .join(' • ');

            const agentName =
                `${agentDetails?.firstName || ''} ${
                    agentDetails?.lastName || ''
                }`.trim() || DEFAULT_ERROR_STRING;
            const productType =
                productTypes.length > 0
                    ? productTypes
                          .map((product) =>
                              ProductTypeLabel.get(product as ProductType)
                          )
                          .join(', ')
                    : [DEFAULT_ERROR_STRING];

            return (
                <TableRow key={id} className={styles.tableRow}>
                    <TableCell className={styles.clientCaseLinkContainer}>
                        <Link
                            onClick={() =>
                                onRowClick(
                                    `client-cases/${caseData.id}/illustrate`,
                                    caseData.id
                                )
                            }
                            href={`client-cases/${caseData.id}/illustrate`}
                            className={styles.clietnCaseLink}
                        >
                            {t(
                                'clientCase.clientCaseTable.viewClientCaseNumber',
                                { clientCaseNumber: caseData.id }
                            )}
                        </Link>
                    </TableCell>
                    <TableCell>
                        <Typography variant={TypographyVariant.BodySm}>
                            <Icon
                                type={IconType.FOLDER}
                                width={16}
                                height={16}
                                className={styles.iconTableAlignment}
                            />
                            <PiiWrapper>{clientCaseTitle}</PiiWrapper>
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant={TypographyVariant.BodySm}>
                            <PiiWrapper>{insuredName}</PiiWrapper>
                        </Typography>
                        <Typography
                            variant={TypographyVariant.BodySm}
                            className={styles.detail}
                        >
                            {insuredDetailsLine}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant={TypographyVariant.BodySm}>
                            <PiiWrapper>{agentName}</PiiWrapper>
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant={TypographyVariant.BodySm}>
                            {agencyName}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant={TypographyVariant.BodySm}>
                            {productType}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant={TypographyVariant.BodySm}>
                            <Icon
                                type={IconType.DOCUMENT_REPORT}
                                width={16}
                                height={16}
                                className={styles.iconTableAlignment}
                            />{' '}
                            {illustrationsCount ?? '0'}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography
                            variant={TypographyVariant.BodySm}
                            className={styles.detail}
                        >
                            {formatRelativeTime(lastModified)}
                        </Typography>
                    </TableCell>
                </TableRow>
            );
        });
    } else {
        return (
            <TableRow className={styles.tableEmptyStateRow}>
                <TableCell colSpan={6} align="center">
                    <Typography variant={TypographyVariant.BodySm}>
                        {t('clientCase.clientCaseTable.emptyState')}
                    </Typography>
                </TableCell>
            </TableRow>
        );
    }
};

export const ClientCaseTable = () => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const { results } = useIllustrationsClientCase();
    const router = useRouter();
    const { sendClientCaseClicked } = useIllustrationAnalytics();

    const goToClientCase = (href: string, clientCaseId: string) => {
        sendClientCaseClicked(clientCaseId, href);
        router.push(href);
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell className="sr-only">
                        {t('clientCase.clientCaseTable.viewClientCaseDetails')}
                    </TableHeaderCell>
                    <TableHeaderCell>
                        <Typography variant={TypographyVariant.BodySmBold}>
                            {t('clientCase.clientCaseTable.clientCase')}
                        </Typography>
                    </TableHeaderCell>
                    <TableHeaderSortWrapper columnId="insuredFirstName">
                        <Typography variant={TypographyVariant.BodySmBold}>
                            {t('clientCase.clientCaseTable.insured')}
                        </Typography>
                    </TableHeaderSortWrapper>
                    <TableHeaderSortWrapper columnId="agentFirstName">
                        <div className={styles.agentHeader}>
                            <Label
                                interactiveElements={[
                                    <Tooltip
                                        key="agentTooltip"
                                        trigger={
                                            <CircleInfoIcon
                                                height={'16px'}
                                                width={'16px'}
                                                className="tooltip-primary"
                                            />
                                        }
                                        triggerClassName={styles.agentTrigger}
                                    >
                                        {t(
                                            'clientCase.clientCaseTable.agentTooltip'
                                        )}
                                    </Tooltip>,
                                ]}
                            >
                                <Typography
                                    variant={TypographyVariant.BodySmBold}
                                >
                                    {t('clientCase.clientCaseTable.agent')}
                                </Typography>
                            </Label>
                        </div>
                    </TableHeaderSortWrapper>
                    <TableHeaderCell>
                        <Typography variant={TypographyVariant.BodySmBold}>
                            {t('clientCase.clientCaseTable.agency')}
                        </Typography>
                    </TableHeaderCell>
                    <TableHeaderCell>
                        <Typography variant={TypographyVariant.BodySmBold}>
                            {t('clientCase.clientCaseTable.productTypes')}
                        </Typography>
                    </TableHeaderCell>
                    <TableHeaderCell>
                        <Typography variant={TypographyVariant.BodySmBold}>
                            {t('clientCase.clientCaseTable.illustrations')}
                        </Typography>
                    </TableHeaderCell>
                    <TableHeaderSortWrapper columnId="lastModified">
                        <Typography variant={TypographyVariant.BodySmBold}>
                            {t('clientCase.clientCaseTable.lastModified')}
                        </Typography>
                    </TableHeaderSortWrapper>
                </TableRow>
            </TableHeader>
            <TableBody>
                {generateTableContent(
                    results?.results || [],
                    t,
                    goToClientCase
                )}
            </TableBody>
        </Table>
    );
};
