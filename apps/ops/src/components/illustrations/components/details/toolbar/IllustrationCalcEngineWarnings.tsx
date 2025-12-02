import { BannerAlert, BannerVariant } from '@zinnia/bloom/components';

import styles from './illustration-details-toolbar.module.css';
import { useIllustrationWarnings } from './use-illustration-warnings';

export const IllustrationCalcEngineWarnings = () => {
    const warnings = useIllustrationWarnings();
    const hasWarnings = !!warnings.length;

    if (!hasWarnings) {
        return null;
    }

    return (
        <div className={styles.bannerWrapperWarning}>
            {warnings.map((warning) => (
                <BannerAlert
                    key={warning}
                    variant={BannerVariant.Warning}
                    bodyText={warning}
                />
            ))}
        </div>
    );
};
