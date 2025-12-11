import clsx from 'clsx';

import styles from './masked-container.module.css';
interface MaskedContainerProps {
    isLoading: boolean;
    children: React.ReactNode;
    overlay?: React.ReactNode;
}
export const MaskedContainer = ({
    isLoading,
    children,
    overlay,
}: MaskedContainerProps) => {
    const contentBoxClassname = clsx({ [styles.blurred]: isLoading });
    return (
        <div className={styles.maskedContainer}>
            <div className={contentBoxClassname}>{children}</div>
            {isLoading && (
                <div className={styles.maskOverlay}>
                    {overlay ?? (
                        <div className="default-loader">Loading...</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MaskedContainer;
