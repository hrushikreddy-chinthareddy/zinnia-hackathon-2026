import styles from '../action-button.module.css';

const StopIcon = () => {
    return (
        <svg viewBox="0 0 24 24" className={styles.stopIcon}>
            <rect
                x="7"
                y="7"
                width="10"
                height="10"
                rx="2"
                fill="currentColor"
            />
        </svg>
    );
};

export default StopIcon;
