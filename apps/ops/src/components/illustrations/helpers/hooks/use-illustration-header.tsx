import {
    CarrierAvatar,
    CarrierName,
    Heading,
    HeadingVariant,
} from '@zinnia/bloom/components';
import { useCallback } from 'react';

import Badge from '@deps/components/badge/badge';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import eAppStyles from '@deps/components/illustrations/components/eapp/eapp.module.css';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { IllustrationsClientCase } from '@deps/types/illustrations';
import { ProductTypeLabel } from '@deps/types/product';

import { IllustrationHandlerFactory } from '../factory/illustrationsHandlerFactory';

export const useIllustrationHeader = () => {
    const { featureFlags } = useOptimizely();
    const buildIllustrationHeader = useCallback(
        (
            planCode: string,
            clientCase?: IllustrationsClientCase,
            actionTitle?: string
        ) => {
            const illustrationHandlerFactory = IllustrationHandlerFactory(
                planCode,
                clientCase,
                featureFlags
            );

            if (!illustrationHandlerFactory) {
                return (
                    <Heading as={HeadingVariant.h3}>
                        {actionTitle || ''}
                    </Heading>
                );
            }
            const carrier = illustrationHandlerFactory.getCarrier();
            const planType = illustrationHandlerFactory.getPlanType();
            const label = illustrationHandlerFactory.getLabel();

            const productTypeLabel = planType
                ? ProductTypeLabel.get(planType)
                : '';

            const eAppHeader = (
                <div className={eAppStyles.infoHeaderWrapper}>
                    <CarrierAvatar
                        carrier={carrier as CarrierName}
                        height={48}
                        width={48}
                    />
                    <div>
                        <div className={eAppStyles.infoHeader}>
                            {productTypeLabel && (
                                <Badge
                                    variant={BadgeVariant.Brand}
                                    label={productTypeLabel}
                                />
                            )}
                            <div
                                className={`--typography-labels-label-lg-alt ${eAppStyles.headerSubtitle}`}
                            >
                                {label}
                            </div>
                        </div>
                        <div>
                            <Heading as={HeadingVariant.h3}>
                                {actionTitle || ''}
                            </Heading>
                        </div>
                    </div>
                </div>
            );

            return eAppHeader;
        },
        [featureFlags]
    );

    return {
        buildIllustrationHeader,
    };
};
