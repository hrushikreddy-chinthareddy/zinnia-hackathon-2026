import { Icon, IconType, PopoverPlacement } from '@zinnia/bloom/components';
import { TFunction } from 'next-i18next';

import BadgeWithTooltip from '@deps/components/badge/badge-with-tooltip/badge-with-tooltip';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';

import {
    UncashedTransactionStatus,
    UncashedTransactionStatusLabel,
} from '../transactions-step-additional-data.types';

interface Props {
    currentStatus: UncashedTransactionStatus;
    isPostDeath: boolean;
    transactionId: string;
    t: TFunction;
}

interface TransactionFlowStep {
    status: UncashedTransactionStatus;
    labelKey: string;
    tooltipKey: string;
    isActive: boolean;
    badgeVariant: BadgeVariant;
    showCheckmark: boolean;
}

const getTransactionFlowWithMeta = (
    currentStatus: UncashedTransactionStatus,
    isPostDeath: boolean
): TransactionFlowStep[] => {
    const steps = isPostDeath
        ? [
              {
                  status: UncashedTransactionStatus.OUTSTANDING,
                  label: UncashedTransactionStatusLabel.OUTSTANDING,
              },
              {
                  status: UncashedTransactionStatus.STOP,
                  label: UncashedTransactionStatusLabel.STOP,
              },
              {
                  status: UncashedTransactionStatus.REVERSED,
                  label: UncashedTransactionStatusLabel.REVERSED,
              },
          ]
        : [
              {
                  status: UncashedTransactionStatus.OUTSTANDING,
                  label: UncashedTransactionStatusLabel.OUTSTANDING,
              },
              {
                  status: UncashedTransactionStatus.STOP,
                  label: UncashedTransactionStatusLabel.STOP,
              },
              {
                  status: UncashedTransactionStatus.SEND_CHECK_TO_ESTATE,
                  label: UncashedTransactionStatusLabel.SEND_CHECK_TO_ESTATE,
              },
          ];

    const finalStatus = isPostDeath
        ? UncashedTransactionStatus.REVERSED
        : UncashedTransactionStatus.SEND_CHECK_TO_ESTATE;

    const currentIndex = steps.findIndex((s) => s.status === currentStatus);

    return steps.map((step, index) => {
        const status = step.status;

        let badgeVariant: BadgeVariant;
        switch (status) {
            case UncashedTransactionStatus.SEND_CHECK_TO_ESTATE:
            case UncashedTransactionStatus.REVERSED:
                badgeVariant = BadgeVariant.Success;
                break;
            case UncashedTransactionStatus.OUTSTANDING:
                badgeVariant = BadgeVariant.Pending;
                break;
            case UncashedTransactionStatus.STOP:
                badgeVariant = BadgeVariant.Warning;
                break;
            default:
                badgeVariant = BadgeVariant.Default;
        }

        return {
            status,
            labelKey: `transactionListing.labels.${step.label}`,
            tooltipKey: `transactionListing.tooltips.${step.label}`,
            isActive: index === currentIndex,
            badgeVariant,
            showCheckmark: currentStatus === status && status === finalStatus,
        };
    });
};

export function UncashedFlowBadges({
    currentStatus,
    isPostDeath,
    transactionId,
    t,
}: Props) {
    const flow = getTransactionFlowWithMeta(currentStatus, isPostDeath);
    const currentIndex = flow.findIndex((s) => s.isActive);

    return (
        <div className="flex items-center mt-2">
            {flow.map((step, index) => {
                const isBefore = currentIndex > index;
                const isAfter = currentIndex < index;

                return (
                    <div
                        key={`trans-step-${step.status}-${transactionId}`}
                        className="flex items-center"
                    >
                        <div
                            className={`transition-opacity ${
                                !step.isActive && isBefore ? 'opacity-30' : ''
                            }`}
                        >
                            <BadgeWithTooltip
                                icon={
                                    step.showCheckmark ? (
                                        <Icon
                                            type={IconType.CHECKMARK}
                                            width={14}
                                            height={14}
                                        />
                                    ) : undefined
                                }
                                label={t(step.labelKey)}
                                tooltip={t(step.tooltipKey)}
                                tooltipPlacement={PopoverPlacement.TopRight}
                                variant={
                                    isAfter
                                        ? BadgeVariant.Default
                                        : step.badgeVariant
                                }
                                testId={`trans-badge-${step.status.toLocaleLowerCase()}-${transactionId}`}
                            />
                        </div>

                        {index < flow.length - 1 && (
                            <div className="w-4 h-0.5 bg-gray-200 mx-1"></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
