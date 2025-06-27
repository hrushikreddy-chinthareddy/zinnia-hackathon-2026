import { Loader } from '@zinnia/bloom/components';

import styles from './loading.module.css';

export default function Loading({ height }: { height?: number }) {
    return (
        <div className="container">
            <div
                className={styles.loader}
                style={{
                    height: `${height ?? 600}px`,
                }}
            >
                <Loader />
            </div>
        </div>
    );
}
