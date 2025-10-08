import { FC } from 'react';

import { wholeNumberFormatify } from '@deps/helpers/numbers.helpers';

import styles from './sankey-chart.module.css';
interface SankeyCellTextProps {
    transform: string;
    width: number;
    height: number;
    fill: string;
    count: number;
    title: string;
    textColor?: string;
}

export const SankeyCellText: FC<SankeyCellTextProps> = ({
    transform,
    fill,
    width,
    height,
    count,
    title,
    textColor = 'rgb(33, 33, 33)',
}) => {
    return (
        <foreignObject
            transform={transform}
            x="0"
            y="0"
            style={{ fill }}
            pointerEvents="auto"
            width={width}
            height={height}
        >
            <div className={styles.textContainer} title={title}>
                <span
                    style={{ color: textColor }}
                    className="tracking-normal no-underline font-primary text-xl font-medium"
                >
                    {wholeNumberFormatify(count)}
                </span>
                <span
                    style={{ color: textColor }}
                    className={`font-primary text-sm font-medium leading-4 ml-1 ${styles.titleText}`}
                >
                    {title}
                </span>
            </div>
        </foreignObject>
    );
};
