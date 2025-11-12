import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { HTMLAttributes, PropsWithChildren, useContext } from 'react';

import IconButton from '@deps/components/icon-button/icon-button';
import TempNavInactive from '@deps/components/nav-element/temp-nav-inactive/temp-nav-inactive';
import { PiiProps } from '@deps/components/pii/pii';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Popover, { PopoverPlacement } from '@deps/components/popover/popover';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { toSentenceCase } from '@deps/helpers/string.helpers';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';
import { ReactComponent as EditIcon } from '@deps/styles/elements/icons/icons_outlined/edit-alt.svg';

export type TooltipProps = {
    tooltipTitle?: string | null;
    tooltipBody?: string | null;
    tooltipPlacement?: PopoverPlacement | undefined;
};
export type LabelProps = {
    label: string;
    sentenceCase?: boolean;
    variant: LabelVariant;
    className?: string;
    editable?: boolean;
    isUserPermissionedToEditCards?: boolean;
    handleEditClick?: () => void;
} & PropsWithChildren<PiiProps> &
    TooltipProps &
    HTMLAttributes<HTMLDivElement>;

export enum LabelVariant {
    /* LABELS  https://www.figma.com/file/T6fERLeHQEFTvyTuSZXX8m/Zinnia-Design-System-Foundations?node-id=7332%3A24474&mode=dev */
    LabelCaps = 'label-caps',
    FieldLabel = 'field-label',
    FieldLabelCaps = 'field-label-caps',
    LabelLg = 'label-lg',
    LabelLgAlt = 'label-lg-alt',
    LabelMd = 'label-md',
    LabelMdAlt = 'label-md-atl',
    LabelSm = 'label-sm',
    LabelSmAlt = 'label-sm-alt',
    LabelUnchanged = 'label-unchanged',
}

type LabelData = {
    styles: string;
};

export const labelMapping: Record<LabelVariant, LabelData> = {
    [LabelVariant.LabelCaps]: {
        styles: 'font-primary text-base font-medium uppercase',
    },
    [LabelVariant.FieldLabel]: {
        styles: 'typography-labels-field-label',
    },
    [LabelVariant.FieldLabelCaps]: {
        styles: 'font-secondary text-sm font-medium uppercase',
    },
    [LabelVariant.LabelLg]: {
        styles: 'typography-labels-label-lg',
    },
    [LabelVariant.LabelLgAlt]: {
        styles: 'font-primary text-base font-medium',
    },
    [LabelVariant.LabelMd]: {
        styles: 'font-primary text-md font-semibold',
    },
    [LabelVariant.LabelMdAlt]: {
        styles: 'font-primary text-md font-medium',
    },
    [LabelVariant.LabelSm]: {
        styles: 'font-primary text-sm font-semibold',
    },
    [LabelVariant.LabelSmAlt]: {
        styles: 'font-primary text-sm font-medium',
    },
    [LabelVariant.LabelUnchanged]: {
        styles: 'typography-labels-label-lg',
    },
};

export const Label = ({
    label,
    tooltipBody = '',
    tooltipTitle = '',
    tooltipPlacement = PopoverPlacement.TopRight,
    variant,
    sentenceCase = true,
    editable,
    isUserPermissionedToEditCards,
    pii = false,
    handleEditClick,
    ...rest
}: LabelProps) => {
    const { className, ...newRest } = rest;

    const newLabel =
        sentenceCase && variant !== LabelVariant.LabelUnchanged
            ? toSentenceCase(label)
            : label;

    const { policyDetails } = useContext(PolicyData);
    const { t } = useTranslation();

    let myNode;

    switch (variant) {
        // For now, everything will use the default html structure but I added this so it can be adjusted for future cases.
        default:
            myNode = (
                <div className={labelMapping[variant].styles} {...newRest}>
                    {pii ? <PiiWrapper>{newLabel}</PiiWrapper> : newLabel}
                </div>
            );
    }

    return (
        <div className={clsx('flex items-center gap-2', className)}>
            {myNode}
            {tooltipTitle && tooltipBody && (
                <Popover
                    title={tooltipTitle}
                    body={tooltipBody}
                    placement={tooltipPlacement}
                >
                    <CircleInfoIcon
                        height={16}
                        width={16}
                        className="tooltip-primary"
                    />
                </Popover>
            )}
            {editable && isUserPermissionedToEditCards ? (
                <IconButton onClick={handleEditClick}>
                    <EditIcon height={16} width={16} />
                </IconButton>
            ) : (
                editable && (
                    <TempNavInactive
                        hideIcon
                        tooltipBody={t(
                            'people.card.transactions.permissionDeniedTooltip',
                            {
                                carrier: policyDetails.carrierName,
                            }
                        )}
                    >
                        <EditIcon height={16} width={16} />
                    </TempNavInactive>
                )
            )}
        </div>
    );
};

export default Label;
