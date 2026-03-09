import { IconType } from '@zinnia/bloom/components';
import React from 'react';

import { toSentenceCase } from '@deps/utils/strings';

import { FeedAction } from './enums';
import { getEntityLabel, getStatusLabel } from './utils';

export type FeedIcon =
    | IconType
    | React.ComponentType<React.SVGProps<SVGSVGElement>>;

export const renderFeedMessage = (
    feed: any,
    getUserFullName: (partyId?: string) => string
): React.ReactNode => {
    const { entity, changes, normalizedAction } = feed;

    const entityType = entity?.type;
    const entityLabel = entity?.label;

    const fromValue = changes?.[0]?.from;
    const toValue = changes?.[0]?.to;
    const fieldName = changes?.[0]?.field;

    switch (normalizedAction) {
        case FeedAction.ADDED:
            return (
                <>
                    <b>{getEntityLabel(entityType)}</b> <b>{entityLabel}</b> is
                    added to the case
                </>
            );

        case FeedAction.STATUS_CHANGE:
            return (
                <>
                    <b>{entityLabel}</b> is <b>{getStatusLabel(toValue)}</b>
                </>
            );

        case FeedAction.CREATED:
            return (
                <>
                    <b>{entityLabel}</b>{' '}
                    <b>
                        {entityLabel
                            ? getEntityLabel(entityType)?.toLowerCase()
                            : getEntityLabel(entityType)}
                    </b>{' '}
                    is created.
                </>
            );

        case FeedAction.ASSIGNMENT:
            return (
                <>
                    <b>{entityLabel}</b>{' '}
                    {entityLabel
                        ? getEntityLabel(entityType)?.toLowerCase()
                        : getEntityLabel(entityType)}{' '}
                    is assigned to <b>{getUserFullName(changes?.[0]?.to)}</b>
                </>
            );

        case FeedAction.UNASSIGNMENT:
            return (
                <>
                    <b>{entityLabel}</b>{' '}
                    {entityLabel
                        ? getEntityLabel(entityType)?.toLowerCase()
                        : getEntityLabel(entityType)}{' '}
                    is unassigned.
                </>
            );

        case FeedAction.PRIORITIZED:
            return (
                <>
                    <b>{getEntityLabel(entityType)}</b> is prioritized by{' '}
                    <b>{getUserFullName(feed?.source?.performedBy)}</b>
                </>
            );

        case FeedAction.DEPRIORITIZED:
            return (
                <>
                    <b>{getEntityLabel(entityType)}</b> is de-prioritized by{' '}
                    <b>{toSentenceCase(toValue)}</b>
                </>
            );

        case FeedAction.UPDATED:
            return (
                <>
                    <b>{fieldName}</b> is updated from <b>{fromValue}</b> to{' '}
                    <b>{toValue}</b>
                </>
            );

        default:
            return null;
    }
};
