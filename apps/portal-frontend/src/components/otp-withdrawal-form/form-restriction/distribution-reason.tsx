import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { EmergencyOption, HardshipOption, RestrictionOption } from '@deps/models/case/withdrawal/case';

import RestrictionOptionComponent, { OptionComponentProps } from './restriction-option-component';

// This was the solution to generic typing a method.

type distributionReasonProps = {
    reasonOptions: Option<RestrictionOption>[];
    hardshipOptions?: Option<HardshipOption>[];
    unforeseenOptions?: Option<EmergencyOption>[];
    isFormStateReadOnly?: boolean;
};

export type Option<T> = { label: string; value: T; subElement?: JSX.Element };

export default function DistributionReason({
    reasonOptions,
    hardshipOptions,
    unforeseenOptions: unforeseenOptions,
    isFormStateReadOnly,
}: distributionReasonProps) {
    const { formRestriction, setFormRestriction } = useContext(FormDataContext);
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.distributionReason' });
    const [reason, setReason] = useState(formRestriction?.restrictions ?? []);
    const [hardship, setHardship] = useState(formRestriction?.hardship ?? []);
    const [unforeseeableEmergency, setUnforeseeableEmergency] = useState(formRestriction?.emergency ?? []);

    useEffect(() => {
        setFormRestriction(restrictions => ({
            ...restrictions,
            restrictions: reason,
            hardship: hardship,
            emergency: unforeseeableEmergency,
        }));
    }, [reason, hardship, unforeseeableEmergency, setFormRestriction]);

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <Typography variant={TypographyVariant.H3} data-testid="data-testid-distribution-reason-title">
                {t('distributionReasonDetails')}
            </Typography>
            <div className="mt-4 flex flex-col gap-4">
                {
                    <ReasonOptionComponent
                        options={reasonOptions}
                        isFormStateReadOnly={isFormStateReadOnly}
                        restriction={reason}
                        setRestriction={setReason}
                        legend={t('reason')}
                    />
                }
                {hardshipOptions && (
                    <HardshipOptionComponent
                        options={hardshipOptions}
                        restriction={hardship}
                        setRestriction={setHardship}
                        legend={t('hardship')}
                        isFormStateReadOnly={isFormStateReadOnly}
                    />
                )}
                {unforeseenOptions && (
                    <UnforeseenOptionsComponent
                        options={unforeseenOptions}
                        restriction={unforeseeableEmergency}
                        setRestriction={setUnforeseeableEmergency}
                        legend={t('unforeseeableEmergency')}
                        isFormStateReadOnly={isFormStateReadOnly}
                    />
                )}
            </div>
        </CardContainer>
    );
}

type ReasonOptionProps = OptionComponentProps<RestrictionOption>;

export function ReasonOptionComponent(props: ReasonOptionProps) {
    const containerClasses = (subElement: JSX.Element | undefined): string => {
        return clsx('flex flex-row gap-4', {
            'items-start': !!subElement,
            'items-center': !subElement,
        });
    };
    return <RestrictionOptionComponent {...props} classes={containerClasses} />;
}

type HardshipOptionProps = OptionComponentProps<HardshipOption>;

export function HardshipOptionComponent(props: HardshipOptionProps) {
    return <RestrictionOptionComponent {...props} />;
}

type UnforeseenOptionsProps = OptionComponentProps<EmergencyOption>;

export function UnforeseenOptionsComponent(props: UnforeseenOptionsProps) {
    return <RestrictionOptionComponent {...props} />;
}
