import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { PolicyFeature, Rider } from '@deps/models/policy/sor-policy';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

export enum ExtraFilters {
    All = 'All',
    Riders = 'Rider',
    Features = 'Feature',
    Active = 'active',
    Available = 'available',
    Terminated = 'terminated',
    Expired = 'expired',
    Pending = 'pending',
}

export enum FilterKeys {
    Type = 'type',
    Status = 'status',
}

export const filterValidFeature = (feature: PolicyFeature) =>
    feature.startDate &&
    feature.endDate &&
    dayjs(feature.startDate, ZAHARA_API_DATE_FORMAT).isValid() &&
    dayjs(feature.endDate, ZAHARA_API_DATE_FORMAT).isValid();

export const calculaterFilterProps = ({
    riders,
    features: originalFeatures,
    t,
}: {
    riders: Rider[] | undefined;
    features: PolicyFeature[] | undefined;
    t: TFunction;
}) => {
    const features = originalFeatures?.filter(filterValidFeature) ?? [];

    const numActive =
        (riders?.filter(rider => rider.status?.toLowerCase() === ExtraFilters.Pending).length ?? 0) +
        features.filter(feature => feature.approvalDate && !dayjs(feature.endDate, ZAHARA_API_DATE_FORMAT).isBefore(dayjs())).length;
    const numAvailable =
        (riders?.filter(rider => rider.status?.toLowerCase() === ExtraFilters.Active).length ?? 0) +
        features.filter(feature => !feature.approvalDate && !dayjs(feature.endDate, ZAHARA_API_DATE_FORMAT).isBefore(dayjs())).length;
    const numTerminated =
        (riders?.filter(rider => rider.status?.toLowerCase() === ExtraFilters.Terminated).length ?? 0) +
        features.filter(feature => dayjs(feature.endDate, ZAHARA_API_DATE_FORMAT).isBefore(dayjs())).length;

    const quantitySort = (a: { quantity: number | undefined }, b: { quantity: number | undefined }) =>
        a.quantity === 0 ? 1 : b.quantity === 0 ? -1 : 1;

    return [
        {
            text: t(`filter.${ExtraFilters.Riders}`),
            value: ExtraFilters.Riders,
            quantity: riders?.length,
            disabled: riders?.length === 0,
        },
        {
            text: t(`filter.${ExtraFilters.Features}`),
            value: ExtraFilters.Features,
            quantity: features.length,
            disabled: features.length === 0,
        },
        {
            text: t(`filter.${ExtraFilters.Active}`),
            value: ExtraFilters.Active,
            quantity: numActive,
            disabled: numActive === 0,
        },
        {
            text: t(`filter.${ExtraFilters.Available}`),
            value: ExtraFilters.Available,
            quantity: numAvailable,
            disabled: numAvailable === 0,
        },
        {
            text: t(`filter.${ExtraFilters.Terminated}`),
            value: ExtraFilters.Terminated,
            quantity: numTerminated,
            disabled: numTerminated === 0,
        },
    ].sort(quantitySort);
};
