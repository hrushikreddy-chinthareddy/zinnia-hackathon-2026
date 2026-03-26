import { IconType } from '@zinnia/bloom/components';
import { TFunction } from 'i18next';
import React from 'react';

import { toSentenceCase } from '@deps/utils/strings';

import { EntityType, FeedAction } from './enums';
import { getEntityLabel, getStatusLabel } from './utils';

export type FeedIcon =
    | IconType
    | React.ComponentType<React.SVGProps<SVGSVGElement>>;

export const renderFeedMessage = (
    feed: any,
    getUserFullName: (partyId?: string) => string,
    t: TFunction
): React.ReactNode => {
    const { entity, changes, normalizedAction } = feed;

    const entityType = entity?.type;
    const entityLabel = entity?.label;
    const instanceInfo = entity?.instanceInfo;
    const isMultiInstanceStep =
        (entityType === EntityType.STEP || entityType === EntityType.TASK) &&
        Boolean(instanceInfo);

    const fromValue = changes?.[0]?.from;
    const toValue = changes?.[0]?.to;
    const fieldName = changes?.[0]?.field;

    if (isMultiInstanceStep && normalizedAction === FeedAction.STATUS_CHANGE) {
        return (
            <>
                <b>{entityLabel}</b> for <b>{instanceInfo.label}</b> is{' '}
                <b>{getStatusLabel(toValue, t)}</b>
            </>
        );
    }

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
                    <b>{entityLabel}</b> is <b>{getStatusLabel(toValue, t)}</b>
                </>
            );

        case FeedAction.CREATED:
            return (
                <>
                    <b>{entityLabel}</b> <b>{getEntityLabel(entityType)}</b> is
                    created.
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
