import { getAccessToken } from '@auth0/nextjs-auth0';
import { useQuery } from '@tanstack/react-query';
import {
    CarrierAvatar,
    CarrierName,
    FieldDateRange,
    FieldSize,
    Pagination,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useCallback, useEffect, useMemo, useState } from 'react';

import DocumentPreviewer from '@deps/components/document-viewer/document-previewer';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import { TranslationFiles } from '@deps/config/translations';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { ZAHARA_DATE_FORMAT } from '@deps/helpers/date.helpers';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { getDocumentSearchResultsQuery } from '@deps/queries/tanstack/documentQueries/document-queries';
import { DEFAULT_EXTENDED_DAY_DATE_FORMAT } from '@deps/types/constants';
import {
    SegmentPageName,
    SegmentTrackedPageProps,
} from '@deps/types/segment-analytics';
import {
    getExternalAgentId,
    getMasterAgentNumber,
} from '@deps/utils/agent-helpers';
import { getCarrierNameByClientId } from '@deps/utils/carriers';
import {
    logWarn,
    parseErrorInformation,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import { DocumentClassificationEnum } from '@zinnia/api-types/types/documents-v3';
import nextI18nextConfig from 'next-i18next.config';

import styles from './index.module.css';

dayjs.extend(utc);

interface CommissionsStatementsProps extends SegmentTrackedPageProps {}

const CommissionsStatements = ({ user }: CommissionsStatementsProps) => {
    const limit = 25;

    const { t } = useTranslation(TranslationFiles.COMMON);
    useSegmentPageTracker(user, SegmentPageName.CommissionsStatements);
    const { partyReferenceData } = usePermissionsContext();

    const [parentCarrierCode, setParentCarrierCode] = useState('');
    const [offset, setOffset] = useState(0);
    const [timerange, setTimerange] = useState({
        from: dayjs().subtract(1, 'month').format(ZAHARA_DATE_FORMAT),
        to: dayjs().format(ZAHARA_DATE_FORMAT),
    });

    const masterAgentNumber = getMasterAgentNumber(partyReferenceData);
    const externalId = getExternalAgentId(partyReferenceData);

    const carrierSelectOptions = useMemo(() => {
        const uniqueCarriers = new Set();

        return partyReferenceData?.alias
            ?.filter((alias) => alias.carrier)
            .filter((alias) => {
                if (uniqueCarriers.has(alias.carrier)) {
                    return false;
                }
                uniqueCarriers.add(alias.carrier);
                return true;
            })
            .map((alias) => ({
                value: alias?.carrier || '',
                textValue:
                    getCarrierNameByClientId(alias?.carrier || '') ||
                    alias?.carrier?.toUpperCase() ||
                    '',
            }));
    }, [partyReferenceData?.alias]);

    const searchBody = {
        parentCarrierCode: parentCarrierCode.toUpperCase(),
        masterAgentNumber,
        externalId,
        documentStartDate: dayjs(timerange.from).format(ZAHARA_DATE_FORMAT),
        documentEndDate: dayjs(timerange.to)
            .add(1, 'day')
            .format(ZAHARA_DATE_FORMAT), //Add an extra day because the API doesn't support adding times to the end date correctly
        documentType: 'COMM',
        documentClassification: DocumentClassificationEnum.OUTBOUND,
    };

    const {
        data: commissionStatements,
        isLoading: loadingPolicyDocuments,
        isFetching,
    } = useQuery({
        queryKey: ['commissionsStatements', searchBody, limit, offset],
        queryFn: () => getDocumentSearchResultsQuery(searchBody, limit, offset),
        enabled:
            !!searchBody.masterAgentNumber && !!searchBody.parentCarrierCode,
        placeholderData: (previousData) => previousData,
    });

    const handleRangeChange = (value: { from: string; to: string }) => {
        setTimerange(value);
    };

    const goToPage = useCallback(
        (pageNumber: number) => {
            window.scroll(0, 0);
            setOffset((pageNumber - 1) * limit);
        },
        [setOffset]
    );

    //Default to a carrier if there is only one available
    useEffect(() => {
        if (carrierSelectOptions?.length === 1) {
            setParentCarrierCode(carrierSelectOptions[0].value ?? '');
        }
    }, [carrierSelectOptions]);

    const carrierName =
        getCarrierNameByClientId(parentCarrierCode).toLowerCase();

    return (
        <div className={styles.pageWrapper}>
            <div>
                <h1 className="typography-desktop-headline-1-d">
                    {t('commissions.statements.title')}
                </h1>

                <div className={styles.filters}>
                    <Select
                        disabled={carrierSelectOptions?.length === 1}
                        placeholder={
                            t(
                                'commissions.statements.carrierSelectPlaceholder'
                            ) ?? ''
                        }
                        options={carrierSelectOptions || []}
                        onValueChange={setParentCarrierCode}
                        value={parentCarrierCode}
                        fieldSize={FieldSize.Small}
                        triggerClassName={styles.carrierSelect}
                    />

                    <div className={styles.carrierSelect}>
                        <FieldDateRange
                            name="commissionStatementsDateRange"
                            showApplyButtons
                            showResetButton={false}
                            onApply={(startDate, endDate) => {
                                handleRangeChange({
                                    from: dayjs(startDate).format(
                                        ZAHARA_DATE_FORMAT
                                    ),
                                    to: dayjs(endDate).format(
                                        ZAHARA_DATE_FORMAT
                                    ),
                                });
                            }}
                            defaultEndDate={timerange.to}
                            defaultStartDate={timerange.from}
                        />
                    </div>
                </div>
            </div>
            <div>
                <BlurOverlayLoader loading={isFetching}>
                    <Table>
                        <TableHeader>
                            <TableHeaderCell>
                                {t('commissions.statements.documentId')}
                            </TableHeaderCell>
                            <TableHeaderCell>
                                {t('commissions.statements.receivedDate')}
                            </TableHeaderCell>
                            <TableHeaderCell>
                                {t('commissions.statements.actions')}
                            </TableHeaderCell>
                        </TableHeader>

                        <TableBody>
                            {loadingPolicyDocuments ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="text-center"
                                    >
                                        {t('policy.documents.loadingDocuments')}
                                    </TableCell>
                                </TableRow>
                            ) : commissionStatements?.data?.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="text-center"
                                    >
                                        {t('commissions.statements.notFound')}
                                    </TableCell>
                                </TableRow>
                            ) : parentCarrierCode?.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="text-center"
                                    >
                                        {t(
                                            'commissions.statements.selectACarrier'
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                commissionStatements?.data?.map((document) => (
                                    <TableRow key={document.documentId}>
                                        <TableCell
                                            className={styles.carrierCell}
                                        >
                                            <CarrierAvatar
                                                carrier={
                                                    carrierName as CarrierName
                                                }
                                                height={32}
                                                width={32}
                                            />
                                            <div>
                                                <p>{document.displayName}</p>
                                                <p className="typography-content-caption">
                                                    {document.documentId}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {dayjs(
                                                document.documentDate
                                            ).format(
                                                DEFAULT_EXTENDED_DAY_DATE_FORMAT
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <DocumentPreviewer
                                                {...document}
                                                carrier={parentCarrierCode.toUpperCase()}
                                                activeDocType={
                                                    document.documentSource
                                                }
                                                displayName={document.displayName?.trim()}
                                            >
                                                {t('general.download')}
                                            </DocumentPreviewer>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </BlurOverlayLoader>

                {!loadingPolicyDocuments &&
                    commissionStatements?.data &&
                    commissionStatements?.data?.length >= 1 && (
                        <div className={styles.pagination}>
                            <Pagination
                                total={commissionStatements?.total || 0}
                                offset={offset}
                                limit={limit}
                                goToPage={goToPage}
                            />
                        </div>
                    )}
            </div>
        </div>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            // Get the user object from the Auth0 Session
            const user = await getUserData(context);
            const { locale = DEFAULT_LOCALE, res, req } = context;
            try {
                (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('policies/index:: Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }

            const translations = await serverSideTranslations(
                locale,
                [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                nextI18nextConfig,
                ALL_LOCALES
            );

            return {
                props: {
                    locale,
                    user,
                    ...translations,
                },
            };
        },
    },
    { file: 'policies/index', function: 'getServerSideProps', page: 'policies' }
);

export default CommissionsStatements;
