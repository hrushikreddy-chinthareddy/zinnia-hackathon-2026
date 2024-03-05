import clsx from "clsx";
import { DividerProps, colorVar } from "."
import styles from './divider.module.css'

export const Divider = ({direction, color = 'default'}: DividerProps) => (
    <div className={clsx({[styles.horizontal as string]: direction === 'horizontal', [styles.vertical as string]: direction === 'vertical'})} style={{ backgroundColor: colorVar[color]}}/>
);