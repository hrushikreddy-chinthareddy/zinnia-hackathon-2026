import { IconType } from '@zinnia/bloom/components';
import { TFunction } from 'i18next';
import React from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import { toSentenceCase } from '@deps/utils/strings';

import activityFeedStyles from './activity-feed.module.css';
import { EntityType, FeedAction } from './enums';
import { getEntityLabel, getStatusLabel } from './utils';

export type FeedIcon =
    | IconType
    | React.ComponentType<React.SVGProps<SVGSVGElement>>;

export const renderFeedMessage = (
    feed: any,
    parentItem: any,
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
                    <b>{getEntityLabel(entityType)}</b> <b>{entityLabel}</b>{' '}
                    {t('allFields.isAddedToTheCase')}
                </>
            );

        case FeedAction.STATUS_CHANGE:
            if (entityType === 'EXCEPTION') {
                return (
                    <>
                        <b>{t('allFields.exceptions')}</b>{' '}
                        {t('allFields.resolvedOn').toLowerCase()}
                        {parentItem?.entity?.label && (
                            <>
                                {' '}
                                <b>{parentItem.entity.label}</b>
                            </>
                        )}
                        <br />
                        <div
                            className={
                                activityFeedStyles.exceptionReasonContainer
                            }
                        >
                            <Content
                                details={entityLabel}
                                variant={ContentVariant.Caption}
                                contentClassName={
                                    activityFeedStyles.exceptionReasonSuccess
                                }
                            />
                        </div>
                    </>
                );
            }

            return (
                <>
                    <b>{entityLabel}</b>
                    {''} {t('allFields.is')} <b>{getStatusLabel(toValue, t)}</b>
                </>
            );

        case FeedAction.CREATED:
            if (entityType === 'EXCEPTION') {
                return (
                    <>
                        <b>{t('allFields.exceptions')}</b>{' '}
                        {t('allFields.occuredOn')}
                        {parentItem?.entity?.label && (
                            <>
                                {' '}
                                <b>{parentItem.entity.label}</b>
                            </>
                        )}
                        <br />
                        <div
                            className={
                                activityFeedStyles.exceptionReasonContainer
                            }
                        >
                            <Content
                                details={entityLabel}
                                variant={ContentVariant.Caption}
                                contentClassName={
                                    activityFeedStyles.exceptionReasonError
                                }
                            />
                        </div>
                    </>
                );
            }

            return (
                <>
                    <b>{entityLabel}</b> <b>{getEntityLabel(entityType)}</b>
                    {t('allFields.isCreated')}
                </>
            );

        case FeedAction.ASSIGNMENT:
            return (
                <>
                    <b>{entityLabel}</b>{' '}
                    {entityLabel
                        ? getEntityLabel(entityType)?.toLowerCase()
                        : getEntityLabel(entityType)}{' '}
                    {t('allFields.isAssignedTo')}{' '}
                    <b>{getUserFullName(changes?.[0]?.to)}</b>
                </>
            );

        case FeedAction.UNASSIGNMENT:
            return (
                <>
                    <b>{entityLabel}</b>{' '}
                    {entityLabel
                        ? getEntityLabel(entityType)?.toLowerCase()
                        : getEntityLabel(entityType)}{' '}
                    {t('allFields.isUnassigned')}
                </>
            );

        case FeedAction.PRIORITIZED:
            return (
                <>
                    <b>{getEntityLabel(entityType)}</b>{' '}
                    {t('allFields.isPrioritizedBy')}{' '}
                    <b>{getUserFullName(feed?.source?.performedBy)}</b>
                </>
            );

        case FeedAction.DEPRIORITIZED:
            return (
                <>
                    <b>{getEntityLabel(entityType)}</b>{' '}
                    {t('allFields.isDeprioritizedBy')}{' '}
                    <b>{toSentenceCase(toValue)}</b>
                </>
            );

        case FeedAction.UPDATED:
            return (
                <>
                    <b>{fieldName}</b> {t('allFields.isUpdatedFrom')}{' '}
                    <b>{fromValue}</b> {t('allFields.to')} <b>{toValue}</b>
                </>
            );

        default:
            return null;
    }
};
