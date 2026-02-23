import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { PolicyFeature, Rider } from '@zinnia/api-types/types/sor';

import { RIDER_NOT_ELECTED } from '../policy-extras-cards/consts';

export enum ExtraFilters {
    All = 'All',
    Riders = 'Rider',
    Features = 'Feature',
    Active = 'active',
    Available = 'available',
    Terminated = 'terminated',
    Expired = 'expired',
    Pending = 'pending',
    NotElected = 'notElected',
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

const sum = (acc: number, curr: number) => acc + curr;

const totalSum = (numbers: number[]) => numbers.reduce(sum, 0);

export const calculaterFilterProps = ({
    riders,
    features: originalFeatures,
    t,
}: {
    riders?: Rider[];
    features?: PolicyFeature[];
    t: TFunction;
}) => {
    const features = originalFeatures?.filter(filterValidFeature) ?? [];

    const numActiveRiders =
        riders?.filter(
            (rider) => rider.status?.toLowerCase() === ExtraFilters.Pending
        ).length ?? 0;

    const numActiveFeatures = features.filter(
        (feature) =>
            feature.approvalDate &&
            !dayjs(feature.endDate, ZAHARA_API_DATE_FORMAT).isBefore(dayjs())
    ).length;

    const numAvailableRiders =
        riders?.filter(
            (rider) => rider.status?.toLowerCase() === ExtraFilters.Active
        ).length ?? 0;

    const numAvailableFeatures = features.filter(
        (feature) =>
            !feature.approvalDate &&
            !dayjs(feature.endDate, ZAHARA_API_DATE_FORMAT).isBefore(dayjs())
    ).length;

    const numTerminatedRiders =
        riders?.filter(
            (rider) => rider.status?.toLowerCase() === ExtraFilters.Terminated
        ).length ?? 0;

    const numTerminatedFeatures = features.filter((feature) =>
        dayjs(feature.endDate, ZAHARA_API_DATE_FORMAT).isBefore(dayjs())
    ).length;

    const numNotElected =
        riders?.filter((rider) => rider.riderElected === RIDER_NOT_ELECTED)
            .length ?? 0;

    const totalRiders = totalSum([
        numActiveRiders,
        numAvailableRiders,
        numTerminatedRiders,
        numNotElected,
    ]);

    const totalFeatures = totalSum([
        numActiveFeatures,
        numAvailableFeatures,
        numTerminatedFeatures,
    ]);

    return [
        {
            text: t(
                `policy.detailCards.ridersAndFeatures.filter.${ExtraFilters.Riders}`
            ),
            value: ExtraFilters.Riders,
            quantity: riders?.length,
            disabled: riders?.length === 0,
            options: [
                {
                    text: t(
                        `policy.detailCards.ridersAndFeatures.filter.${ExtraFilters.All}`
                    ),
                    value: ExtraFilters.All,
                    quantity: totalRiders,
                    disabled: totalRiders === 0,
                },
                {
                    text: t(
                        `policy.detailCards.ridersAndFeatures.filter.${ExtraFilters.Active}`
                    ),
                    value: ExtraFilters.Active,
                    quantity: numActiveRiders,
                    disabled: numActiveRiders === 0,
                },
                {
                    text: t(
                        `policy.detailCards.ridersAndFeatures.filter.${ExtraFilters.Available}`
                    ),
                    value: ExtraFilters.Available,
                    quantity: numAvailableRiders,
                    disabled: numAvailableRiders === 0,
                },
                {
                    text: t(
                        `policy.detailCards.ridersAndFeatures.filter.${ExtraFilters.Terminated}`
                    ),
                    value: ExtraFilters.Terminated,
                    quantity: numTerminatedRiders,
                    disabled: numTerminatedRiders === 0,
                },
                {
                    text: t(
                        `policy.detailCards.ridersAndFeatures.filter.${ExtraFilters.NotElected}`
                    ),
                    value: ExtraFilters.NotElected,
                    quantity: numNotElected,
                    disabled: numNotElected === 0,
                },
            ],
        },
        {
            text: t(
                `policy.detailCards.ridersAndFeatures.filter.${ExtraFilters.Features}`
            ),
            value: ExtraFilters.Features,
            quantity: features.length,
            disabled: features.length === 0,
            options: [
                {
                    text: t(
                        `policy.detailCards.ridersAndFeatures.filter.${ExtraFilters.All}`
                    ),
                    value: ExtraFilters.All,
                    quantity: totalFeatures,
                    disabled: totalFeatures === 0,
                },
                {
                    text: t(
                        `policy.detailCards.ridersAndFeatures.filter.${ExtraFilters.Active}`
                    ),
                    value: ExtraFilters.Active,
                    quantity: numActiveFeatures,
                    disabled: numActiveFeatures === 0,
                },
                {
                    text: t(
                        `policy.detailCards.ridersAndFeatures.filter.${ExtraFilters.Available}`
                    ),
                    value: ExtraFilters.Available,
                    quantity: numAvailableFeatures,
                    disabled: numAvailableFeatures === 0,
                },
                {
                    text: t(
                        `policy.detailCards.ridersAndFeatures.filter.${ExtraFilters.Terminated}`
                    ),
                    value: ExtraFilters.Terminated,
                    quantity: numTerminatedFeatures,
                    disabled: numTerminatedFeatures === 0,
                },
            ],
        },
    ];
};
