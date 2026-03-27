import { useQuery } from '@tanstack/react-query';
import { Icon } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useMemo, useState } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import Label, { LabelVariant } from '@deps/components/label/label';
import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { Case } from '@deps/models/case/case';
import { getUserDataByPartyIds } from '@deps/queries/api/parties';
import { getActivityFeedQuery } from '@deps/queries/tanstack/caseQueries/caseQueries';
import { ReactComponent as AscendingIcon } from '@deps/styles/elements/icons/icons_outlined/sort-ascending.svg';
import { ReactComponent as DescendingIcon } from '@deps/styles/elements/icons/icons_outlined/sort-descending.svg';
import { formatFeedDate, formatFeedTime } from '@deps/utils/dates';

import activityFeedStyles from './activity-feed.module.css';
import { EntityLabel, FeedAction } from './enums';
import { renderFeedMessage } from './renderer';
import { getFeedIconConfig, transformFeed } from './utils';

export type Feed = {
    id?: string;
    time: string;
    action: string;
    entity?: any;
    rootEntity?: any;
    changes?: any[];
    source?: any;
};

export default function ActivityFeedTab({
    caseDetails,
}: {
    caseDetails: Case;
}) {
    const { t } = useTranslation();

    const [activeFilter, setActiveFilter] = useState<string>('ALL');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
    const [initialFeeds, setInitialFeeds] = useState<Feed[]>([]);

    const activityFeedPayload = useMemo(
        () => ({
            filters: activeFilter !== 'ALL' ? { entityType: activeFilter } : {},
            sort: {
                order: sortOrder,
            },
        }),
        [activeFilter, sortOrder]
    );

    const caseId = caseDetails.id;
    const { data: activityFeedData, isLoading } = useQuery({
        queryKey: ['activityFeed', caseId, activityFeedPayload],
        queryFn: () => getActivityFeedQuery(caseId, activityFeedPayload),
        enabled: !!caseId,
    });

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === 'DESC' ? 'ASC' : 'DESC'));
    };

    const feeds: Feed[] = useMemo(() => {
        const data = activityFeedData?.data;
        return Array.isArray(data?.feeds) ? data.feeds : [];
    }, [activityFeedData]);

    const partyIds = useMemo(() => {
        const ids = new Set<string>();

        feeds.forEach((feed) => {
            const action = feed?.action?.toUpperCase();

            if (action === FeedAction.PRIORITIZED) {
                if (feed?.source?.performedBy) {
                    ids.add(feed.source.performedBy);
                }
            }

            if (action === FeedAction.ASSIGNMENT) {
                const toPartyId = feed?.changes?.[0]?.to;
                if (toPartyId) {
                    ids.add(toPartyId);
                }
            }
        });

        return Array.from(ids);
    }, [feeds]);

    const { data: userData } = useQuery({
        queryKey: ['partyUsers', partyIds],
        queryFn: () =>
            getUserDataByPartyIds({
                fields: ['firstName', 'lastName'],
                partyIds,
            }),
        enabled: partyIds.length > 0,
    });

    const getUserFullName = (partyId?: string): string => {
        if (!partyId || !userData?.parties?.[partyId]) {
            return partyId as string;
        }

        const { firstName, lastName } = userData.parties[partyId];

        return `${firstName ?? ''} ${lastName ?? ''}`.trim();
    };

    useEffect(() => {
        if (activeFilter === 'ALL' && feeds.length > 0) {
            setInitialFeeds(feeds);
        }
    }, [feeds, activeFilter]);

    const availableEntityTypes = useMemo(() => {
        const source = initialFeeds.length ? initialFeeds : feeds;

        const set = new Set<string>();

        source.forEach((feed) => {
            const type = feed?.entity?.type?.toUpperCase();
            if (type) set.add(type);
        });

        return Array.from(set);
    }, [initialFeeds, feeds]);

    const dynamicFilters = useMemo(() => {
        const filters = availableEntityTypes
            .filter((type) => EntityLabel[type as keyof typeof EntityLabel])
            .map((type) => ({
                value: type,
                label: EntityLabel[type as keyof typeof EntityLabel],
            }));

        return [{ value: 'ALL', label: 'All' }, ...filters];
    }, [availableEntityTypes]);

    const groupedFeeds = feeds.reduce<Record<string, Feed[]>>((acc, feed) => {
        const dateKey = formatFeedDate(feed.time);

        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }

        acc[dateKey].push(feed);
        return acc;
    }, {});

    return (
        <CardContainer classNames={activityFeedStyles.activityFeedContainer}>
            <div className={activityFeedStyles.activityHeaderRow}>
                <Typography
                    className={activityFeedStyles.activityHeader}
                    variant={TypographyVariant.H3}
                >
                    {t('allFields.activity')}
                </Typography>

                <div
                    role="button"
                    onClick={toggleSortOrder}
                    className={activityFeedStyles.sortIcon}
                >
                    {sortOrder === 'ASC' ? (
                        <AscendingIcon width={20} height={20} />
                    ) : (
                        <DescendingIcon width={20} height={20} />
                    )}
                </div>
            </div>
            {dynamicFilters.length > 1 && (
                <div className={activityFeedStyles.filterContainer}>
                    {dynamicFilters.map((filter) => (
                        <button
                            key={filter.value}
                            type="button"
                            onClick={() => setActiveFilter(filter.value)}
                            className={`${activityFeedStyles.filterItem} ${
                                activeFilter === filter.value
                                    ? activityFeedStyles.filterItemActive
                                    : ''
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            )}
            {isLoading ? (
                <div className="p-8">
                    <PageLoader variant={PageLoaderVariant.Center} />
                </div>
            ) : feeds.length > 0 ? (
                <>
                    <div className={activityFeedStyles.timeline}>
                        {Object.entries(groupedFeeds).map(
                            ([date, feedsForDate]) => (
                                <div
                                    key={date}
                                    className={activityFeedStyles.dateGroup}
                                >
                                    <div
                                        className={
                                            activityFeedStyles.dateHeader
                                        }
                                    >
                                        <Label
                                            variant={LabelVariant.LabelLg}
                                            label={date}
                                        />
                                        <div
                                            className={
                                                activityFeedStyles.dateDivider
                                            }
                                        />
                                    </div>

                                    {feedsForDate.map(
                                        (rawFeed: any, index: number) => {
                                            const feed = transformFeed(rawFeed);

                                            //resolve parent
                                            const parentEntity =
                                                feed?.entity
                                                    ?.parentEntityDetails?.[0];
                                            const parentStepId =
                                                parentEntity?.entityId;
                                            const parentItem = feeds.find(
                                                (item) =>
                                                    item?.entity?.id ===
                                                    parentStepId
                                            );

                                            const isLast =
                                                index ===
                                                feedsForDate.length - 1;

                                            const { icon, color } =
                                                getFeedIconConfig(feed);

                                            return (
                                                <div
                                                    key={feed.id ?? index}
                                                    className={
                                                        activityFeedStyles.timelineItem
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            activityFeedStyles.timelineLeft
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                activityFeedStyles.timelineIcon
                                                            }
                                                        >
                                                            {typeof icon ===
                                                            'string' ? (
                                                                <Icon
                                                                    type={icon}
                                                                    height={20}
                                                                    width={20}
                                                                    color={
                                                                        color
                                                                    }
                                                                />
                                                            ) : (
                                                                React.createElement(
                                                                    icon,
                                                                    {
                                                                        width: 16,
                                                                        height: 16,
                                                                        fill: color,
                                                                    }
                                                                )
                                                            )}
                                                        </div>
                                                        {!isLast && (
                                                            <div
                                                                className={
                                                                    activityFeedStyles.timelineConnector
                                                                }
                                                            />
                                                        )}
                                                    </div>

                                                    <div
                                                        className={
                                                            activityFeedStyles.timelineContent
                                                        }
                                                    >
                                                        <Typography
                                                            variant={
                                                                TypographyVariant.BodySm
                                                            }
                                                        >
                                                            {renderFeedMessage(
                                                                feed,
                                                                parentItem,
                                                                getUserFullName,
                                                                t
                                                            )}
                                                        </Typography>

                                                        <Typography
                                                            variant={
                                                                TypographyVariant.BodySm
                                                            }
                                                            className={
                                                                activityFeedStyles.timelineTime
                                                            }
                                                        >
                                                            {formatFeedTime(
                                                                feed.time
                                                            )}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            )
                        )}
                    </div>
                </>
            ) : (
                <div className={activityFeedStyles.emptyState}>
                    <CardInfo title={t('allFields.activityFeedEmptyTitle')} />
                </div>
            )}
        </CardContainer>
    );
}
