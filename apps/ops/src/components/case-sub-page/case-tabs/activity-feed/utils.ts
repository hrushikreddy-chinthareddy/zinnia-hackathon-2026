import { IconType } from '@zinnia/bloom/components';
import { TFunction } from 'i18next';

import { ReactComponent as Warning } from '@deps/styles/elements/icons/alert/warning.svg';

import { Feed } from '.';
import { EntityLabel, EntityType, FeedAction, FeedStatus } from './enums';

type FeedIcon = IconType | React.FC<React.SVGProps<SVGSVGElement>>;

const STATUS_ICON_MAP: Record<string, { icon: FeedIcon; color: string }> = {
    IN_PROGRESS: {
        icon: IconType.IN_PROGRESS,
        color: 'var(--color-semantics-color-semantic-information)',
    },
    COMPLETED: {
        icon: IconType.CIRCLE_CHECKMARK,
        color: 'var(--color-semantics-color-semantic-success)',
    },
    EXCEPTION: {
        icon: IconType.HEX_EXCLAMATION,
        color: 'var( --color-semantics-color-semantic-error)',
    },
    PRIORITIZED: {
        icon: Warning,
        color: 'var(--color-semantics-color-semantic-warning)',
    },
    DEPRIORITIZED: {
        icon: Warning,
        color: 'var(--color-grayscale-color-600-gray)',
    },
};

const ENTITY_ICON_MAP: Record<string, { icon: FeedIcon; color: string }> = {
    CASE: {
        icon: IconType.BRIEFCASE,
        color: 'var(--color-grayscale-color-600-gray)',
    },
    TASK: {
        icon: IconType.CLIPBOARD_LIST,
        color: 'var(--color-grayscale-color-600-gray)',
    },
    DOCUMENT: {
        icon: IconType.DOCUMENT_TEXT,
        color: 'var(--color-grayscale-color-600-gray)',
    },
};

export const getFeedIconConfig = (feed: any) => {
    const { entity, normalizedAction, statusToValue } = feed;

    const entityType = entity?.type?.toUpperCase();
    const action = normalizedAction?.toUpperCase();
    const status = statusToValue?.toUpperCase();

    if (
        (action === 'PRIORITIZED' || action === 'DEPRIORITIZED') &&
        STATUS_ICON_MAP[action]
    ) {
        return STATUS_ICON_MAP[action];
    }

    // Status-based icon takes priority (except for TASK)
    if (
        entityType !== 'TASK' &&
        action === 'STATUS_CHANGE' &&
        status &&
        STATUS_ICON_MAP[status]
    ) {
        return STATUS_ICON_MAP[status];
    }

    // Entity-based icon
    if (entityType && ENTITY_ICON_MAP[entityType]) {
        return ENTITY_ICON_MAP[entityType];
    }

    // Default fallback
    return {
        icon: IconType.CLIPBOARD_LIST,
        color: 'var(--color-neutral-600)',
    };
};

export const transformFeed = (feed: Feed) => {
    const { entity, changes } = feed;

    let action = feed?.action?.toUpperCase() as FeedAction;

    // Normalize action CREATED to ADDED for NOTE & DOCUMENT
    if (
        action === FeedAction.CREATED &&
        (entity?.type === EntityType.NOTE ||
            entity?.type === EntityType.DOCUMENT)
    ) {
        action = FeedAction.ADDED;
    }

    const statusToValue = (changes?.[0]?.to?.value || changes?.[0]?.to) as
        | FeedStatus
        | string
        | null;

    return {
        ...feed,
        normalizedAction: action,
        statusToValue,
    };
};

export const getEntityLabel = (type?: string) =>
    type && EntityLabel[type as keyof typeof EntityLabel]
        ? EntityLabel[type as keyof typeof EntityLabel]
        : type;

export const getStatusLabel = (status: string | undefined, t: TFunction) => {
    if (!status) return '';

    return t(`enums.${status}`).toLowerCase();
};
