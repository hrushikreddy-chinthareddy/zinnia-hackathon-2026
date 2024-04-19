import clsx from "clsx";
import { DividerProps } from "."
import styles from './divider.module.css'

export const Divider = ({ direction, color = 'default' }: DividerProps) =>
    <div className={clsx(styles.divider, styles[direction], styles[color])} />