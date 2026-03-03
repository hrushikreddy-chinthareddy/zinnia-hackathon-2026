import { SideSheet } from '@zinnia/bloom/components';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

import { ViewStateProvider } from '@deps/contexts/ViewStateContext';
import { toTitleCase } from '@deps/helpers/string.helpers';
import { Collapse, TreeStateProvider } from '@deps/hooks/useTreeState';

import { FeatureSidesheetContent } from './content/feature-sidesheet-content';
import { FeatureSidesheetProps } from './types';

/**
 * A Sidesheet component that displays all key-value pairs of a feature.
 *
 * @param {PolicyFeature} feature - the feature
 * @returns {JSX.Element} - the rendered component
 */
export const FindAllKeyValuesFeatureSidesheet = ({
    onOpenChange,
    open,
    policyDetails,
    feature,
}: FeatureSidesheetProps & {
    open: boolean;
    onOpenChange: Dispatch<SetStateAction<boolean>>;
}) => {
    const { t } = useTranslation();
    if (!feature) {
        return null;
    }

    return (
        <SideSheet
            trigger={null}
            header={
                <span className="typography-desktop-headline-2-d">
                    {toTitleCase(
                        t(`enums.${feature.featureType}`, {
                            defaultValue: feature.featureType,
                        }) as string
                    )}
                </span>
            }
            open={open}
            onOpenChange={onOpenChange}
            preventCloseOnOutsideClick={false}
        >
            <ViewStateProvider>
                <TreeStateProvider initialTreeState={Collapse}>
                    <FeatureSidesheetContent
                        policyDetails={policyDetails}
                        feature={feature}
                    />
                </TreeStateProvider>
            </ViewStateProvider>
        </SideSheet>
    );
};
