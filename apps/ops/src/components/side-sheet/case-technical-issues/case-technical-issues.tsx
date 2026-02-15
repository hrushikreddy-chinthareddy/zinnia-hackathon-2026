import {
    Accordion,
    AccordionType,
    Loader,
    LoaderVariant,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useState, useEffect } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import {
    ExceptionAdditionalDataItem,
    ExceptionInstance,
    ExceptionStatuses,
    ExceptionStatusLabels,
} from '@deps/models/case/exception-instance';
import { getExcpetionDetails } from '@deps/queries/api/v1/excpetion-details';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';
import { ReactComponent as ResolvedIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import { browserLogError } from '@deps/utils/browser-logging';
import { formatTimestamp } from '@deps/utils/dates';

import caseTechnicalIssuesStyles from './case-technical-issues.module.css';
import { HeaderLabel } from './components/header-label';

type CaseTechnicalIssuesProps = {
    exceptions: ExceptionInstance[];
    caseId: string;
};

enum NonAdditionalExceptionFields {
    exceptionReason = 'exception_reason',
    createdOn = 'created_on',
    resolvedOn = 'resolved_on',
}

const ORDERED_EXCEPTION_FIELDS = [
    'processing_reason',
    'source',
    'error_code',
    'processing_resolution',
    'exception_reason',
    'created_on',
    'resolved_on',
];

const CaseTechnicalIssues = ({
    exceptions,
    caseId,
}: CaseTechnicalIssuesProps) => {
    const { t } = useTranslation();
    const [exceptionDetailsMap, setExceptionDetailsMap] = useState<
        Record<string, ExceptionAdditionalDataItem[]>
    >({});
    const [loading, setLoading] = useState(false);

    const exceptionLabels: Record<string, string> = {
        error_code: t('allFields.errorCode'),
        source: t('allFields.sourceSystem'),
        processing_reason: t('allFields.summary'),
        processing_resolution: t('allFields.errorDescription'),
        exception_reason: t('allFields.reason'),
        created_on: t('allFields.createdOn'),
        resolved_on: t('allFields.resolvedOn'),
    };

    useEffect(() => {
        if (!exceptions.length || !caseId) return;

        let cancelled = false;

        const fetchExceptionDetails = async () => {
            setLoading(true);
            try {
                const responses = await Promise.all(
                    exceptions.map(async (exception) => {
                        const data = await getExcpetionDetails(
                            caseId,
                            exception.id
                        );

                        const nonAdditionalDataFields = [
                            {
                                id: NonAdditionalExceptionFields.exceptionReason,
                                value: data.detailReason,
                            },
                            {
                                id: NonAdditionalExceptionFields.createdOn,
                                value: formatTimestamp(
                                    data.createdAt,
                                    'tooltip'
                                ),
                            },
                            ...(data.exceptionStatus ===
                            ExceptionStatuses.Resolved
                                ? [
                                      {
                                          id: NonAdditionalExceptionFields.resolvedOn,
                                          value: formatTimestamp(
                                              data.updatedAt,
                                              'tooltip'
                                          ),
                                      },
                                  ]
                                : []),
                        ];

                        return {
                            exceptionId: exception.id,
                            additionalData: Array.isArray(
                                data?.exceptionAdditionalData
                            )
                                ? [
                                      ...nonAdditionalDataFields,
                                      ...data.exceptionAdditionalData,
                                  ]
                                : [...nonAdditionalDataFields],
                        };
                    })
                );

                if (cancelled) return;

                const detailsMap: Record<
                    string,
                    ExceptionAdditionalDataItem[]
                > = {};

                responses.forEach(({ exceptionId, additionalData }) => {
                    detailsMap[exceptionId] = additionalData;
                });

                setExceptionDetailsMap(detailsMap);
                setLoading(false);
            } catch {
                browserLogError(`Error in fetch exception details`);
                setLoading(false);
            }
        };

        fetchExceptionDetails();

        return () => {
            cancelled = true;
        };
    }, [exceptions, caseId]);

    const renderExceptionItem = (exception: ExceptionInstance) => {
        const exceptionAdditionalData = Array.isArray(
            exceptionDetailsMap[exception.id]
        )
            ? exceptionDetailsMap[exception.id]
            : [];

        const getAccordionChildren = () => {
            return loading ? (
                <div className={caseTechnicalIssuesStyles.loaderWrapper}>
                    <Loader variant={LoaderVariant.CTA} />
                </div>
            ) : (
                <div className={caseTechnicalIssuesStyles.exceptionWrapper}>
                    {ORDERED_EXCEPTION_FIELDS.map((fieldId) => {
                        const exceptionItem = exceptionAdditionalData.find(
                            (item) => item.id === fieldId
                        );

                        if (!exceptionItem) return null;

                        return (
                            <div
                                key={exceptionItem.id}
                                className={caseTechnicalIssuesStyles.detailRow}
                            >
                                <Typography
                                    variant={TypographyVariant.BodySm}
                                    className={caseTechnicalIssuesStyles.label}
                                    asTag="p"
                                >
                                    {exceptionLabels[exceptionItem.id]}
                                </Typography>

                                <Typography
                                    variant={TypographyVariant.BodySm}
                                    className={caseTechnicalIssuesStyles.value}
                                    asTag="p"
                                >
                                    {exceptionItem.value}
                                </Typography>
                            </div>
                        );
                    })}
                </div>
            );
        };

        const getHeaderComponent = () => {
            return (
                <div className={caseTechnicalIssuesStyles.header}>
                    <HeaderLabel text={exception.reason} />
                    {exception.status === ExceptionStatuses.New ? (
                        <div className={caseTechnicalIssuesStyles.headerStatus}>
                            <Content
                                variant={ContentVariant.BodySm}
                                className={caseTechnicalIssuesStyles.statusText}
                                details={
                                    t('allFields.inProgress') ||
                                    ExceptionStatusLabels.New
                                }
                                truncate={true}
                            />
                            <InProgressIcon
                                className={
                                    caseTechnicalIssuesStyles.inProgressIcon
                                }
                                width={24}
                                height={24}
                            />
                        </div>
                    ) : (
                        <div className={caseTechnicalIssuesStyles.headerStatus}>
                            <Content
                                variant={ContentVariant.BodySm}
                                className={caseTechnicalIssuesStyles.statusText}
                                details={`${
                                    t('allFields.resolved') ||
                                    ExceptionStatusLabels.Resolved
                                }
                                     on ${formatTimestamp(
                                         exception.updatedAt,
                                         'monthDay'
                                     )}`}
                                truncate={true}
                            />
                            <ResolvedIcon
                                className={
                                    caseTechnicalIssuesStyles.resolvedIcon
                                }
                                width={24}
                                height={24}
                            />
                        </div>
                    )}
                </div>
            );
        };

        return (
            <div className={caseTechnicalIssuesStyles.accordionWrapper}>
                <Accordion
                    sectionLabel={getHeaderComponent()}
                    type={AccordionType.DEFAULT}
                    treeState={true}
                >
                    {getAccordionChildren()}
                </Accordion>
            </div>
        );
    };

    return (
        <div className={caseTechnicalIssuesStyles.container}>
            {exceptions.map(renderExceptionItem)}
        </div>
    );
};

export default CaseTechnicalIssues;
