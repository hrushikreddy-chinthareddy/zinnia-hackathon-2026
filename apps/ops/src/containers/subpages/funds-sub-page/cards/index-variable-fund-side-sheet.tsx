import {
    Icon,
    IconType,
    PopoverPlacement,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import Popover from '@deps/components/popover/popover';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import {
    isNullEmptyOrUndefined,
    toSentenceCase,
} from '@deps/helpers/string.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import styles from './funds-table.module.css';

const IndexVariableFundSideSheet = ({ fund, policy }: any) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.funds.segmentsTable',
    });
    const { t: tfunds } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.funds.fundsTable',
    });

    const { allocation, fundId, fundName, fundValue } = fund;

    // Find the original allocation fund by ID, then use its fundSegments
    const allocationFunds = policy?.policy?.allocation?.funds || [];
    const currentFund = allocationFunds.find((f: any) => f.fundId === fundId);
    const segmentsToRender = currentFund?.fundSegments || [];

    const showParticipation = segmentsToRender.some(
        (s: any) => s.participationRate != null
    );

    const showCapRate = segmentsToRender.some((s: any) => s.capRate != null);

    const showParticipationOrCap = showParticipation || showCapRate;

    const upcomingSortedSegments = segmentsToRender
        .filter(
            (segment: any) => new Date(segment.endingPriceDate) >= new Date()
        )
        .sort((a: any, b: any) => a.segmentId - b.segmentId);

    return (
        <div className="flex flex-col p-8 h-full">
            <Typography
                variant={TypographyVariant.H3}
                className="text-2xl mb-0.5"
            >
                {fundName}
            </Typography>

            <Typography variant={TypographyVariant.Label}>Indexed</Typography>

            <div className="flex flex-row mt-5 w-full">
                <div className="flex flex-1 flex-col gap-1">
                    <Typography variant={TypographyVariant.H4}>
                        {tfunds('fundValue')}
                    </Typography>
                    <Typography variant={TypographyVariant.BodyParagraph}>
                        {isNullEmptyOrUndefined(fundValue)
                            ? DEFAULT_ERROR_STRING
                            : fundValue}
                    </Typography>
                </div>

                <div className="flex flex-1 flex-col gap-1">
                    <Typography variant={TypographyVariant.H4}>
                        {tfunds('allocation')}
                    </Typography>
                    <Typography variant={TypographyVariant.BodyParagraph}>
                        {isNullEmptyOrUndefined(allocation)
                            ? DEFAULT_ERROR_STRING
                            : allocation}
                    </Typography>
                </div>
            </div>

            {/* segment details */}
            <div className="flex flex-col gap-4 py-8">
                <Typography variant={TypographyVariant.H4}>
                    {tfunds('segmentDetails')}
                </Typography>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell
                                className=" whitespace-nowrap"
                                scope="col"
                            >
                                <div className={styles.tableHeaderContainer}>
                                    <Typography
                                        variant={TypographyVariant.BodySmBold}
                                    >
                                        {t('indexFundID')}
                                    </Typography>
                                    <Popover
                                        title={t('segmentID') as string}
                                        body={t('segmentIDTooltip') as string}
                                        placement={PopoverPlacement.TopRight}
                                    >
                                        <Icon
                                            type={IconType.CIRCLE_INFO}
                                            color="var(--color-base-icon-icon-action-text-link)"
                                            height={16}
                                            width={16}
                                        />
                                    </Popover>
                                </div>
                            </TableHeaderCell>

                            <TableHeaderCell
                                className=" whitespace-nowrap"
                                scope="col"
                            >
                                <div className={styles.tableHeaderContainer}>
                                    <Typography
                                        variant={TypographyVariant.BodySmBold}
                                    >
                                        {t('indexPeriod')}
                                    </Typography>
                                    <Popover
                                        title={toSentenceCase(
                                            t('indexPeriod') as string
                                        )}
                                        body={t('indexPeriodTooltip') as string}
                                        placement={PopoverPlacement.TopRight}
                                    >
                                        <Icon
                                            type={IconType.CIRCLE_INFO}
                                            color="var(--color-base-icon-icon-action-text-link)"
                                            height={16}
                                            width={16}
                                        />
                                    </Popover>
                                </div>
                            </TableHeaderCell>

                            <TableHeaderCell
                                className=" whitespace-nowrap"
                                scope="col"
                            >
                                <div className={styles.tableHeaderContainer}>
                                    <Typography
                                        variant={TypographyVariant.BodySmBold}
                                    >
                                        {t('depositAmount')}
                                    </Typography>
                                    <Popover
                                        title={toSentenceCase(
                                            t('depositAmount') as string
                                        )}
                                        body={
                                            t('depositAmountTooltip') as string
                                        }
                                        placement={PopoverPlacement.TopRight}
                                    >
                                        <Icon
                                            type={IconType.CIRCLE_INFO}
                                            color="var(--color-base-icon-icon-action-text-link)"
                                            height={16}
                                            width={16}
                                        />
                                    </Popover>
                                </div>
                            </TableHeaderCell>

                            {showParticipationOrCap && (
                                <TableHeaderCell
                                    className="whitespace-nowrap"
                                    scope="col"
                                >
                                    <div
                                        className={styles.tableHeaderContainer}
                                    >
                                        <Typography
                                            variant={
                                                TypographyVariant.BodySmBold
                                            }
                                        >
                                            {showParticipation
                                                ? (t(
                                                      'participationRate'
                                                  ) as string)
                                                : (t('capRate') as string)}
                                        </Typography>
                                        <Popover
                                            title={
                                                showParticipation
                                                    ? t('participationRate') ||
                                                      ''
                                                    : t('capRate') || ''
                                            }
                                            body={
                                                showParticipation
                                                    ? (t(
                                                          'participationRateTooltip'
                                                      ) as string)
                                                    : (t(
                                                          'capRateTooltip'
                                                      ) as string)
                                            }
                                            placement={
                                                PopoverPlacement.TopRight
                                            }
                                        >
                                            <Icon
                                                type={IconType.CIRCLE_INFO}
                                                color="var(--color-base-icon-icon-action-text-link)"
                                                height={16}
                                                width={16}
                                            />
                                        </Popover>
                                    </div>
                                </TableHeaderCell>
                            )}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {upcomingSortedSegments.map((segment: any) => (
                            <TableRow key={segment.segmentId}>
                                <TableCell className="w-1/5 whitespace-nowrap">
                                    <Typography
                                        variant={
                                            TypographyVariant.BodyParagraph
                                        }
                                    >
                                        {segment.segmentId}
                                    </Typography>
                                </TableCell>

                                <TableCell className="w-3/5 whitespace-nowrap">
                                    <Typography
                                        variant={
                                            TypographyVariant.BodyParagraph
                                        }
                                    >
                                        {`${segment.startDate} - ${segment.endingPriceDate}`}
                                    </Typography>
                                </TableCell>

                                <TableCell className="w-1/5 whitespace-nowrap">
                                    <Typography
                                        variant={
                                            TypographyVariant.BodyParagraph
                                        }
                                    >
                                        {segment.depositAmount}
                                    </Typography>
                                </TableCell>

                                {(showCapRate || showParticipation) && (
                                    <TableCell className="w-1/5 whitespace-nowrap">
                                        <Typography
                                            variant={
                                                TypographyVariant.BodyParagraph
                                            }
                                        >
                                            {isNullEmptyOrUndefined(
                                                showParticipation
                                                    ? segment.participationRate
                                                    : segment.capRate
                                            )
                                                ? DEFAULT_ERROR_STRING
                                                : showParticipation
                                                ? segment.participationRate
                                                : segment.capRate}
                                        </Typography>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default IndexVariableFundSideSheet;
