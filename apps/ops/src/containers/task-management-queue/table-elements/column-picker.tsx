import { Button } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
    useCallback,
} from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { ReactComponent as SettingsIcon } from '@deps/styles/elements/icons/actions/settings-alt.svg';
import { ReactComponent as CheckIcon } from '@deps/styles/elements/icons/content/check-mark.svg';

import { Column, ColumnId } from '../task-queue-columns';
import styles from './column-picker.module.css';

export function useOnClickOutside(
    ref: React.RefObject<HTMLElement>,
    handler: (event: MouseEvent | TouchEvent) => void
) {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node))
                return;
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
}

type Props<T> = {
    title?: string;
    availableColumns: Column<T>[];
    selectedIds: ColumnId[] | null;
    onChange: (ids: ColumnId[]) => void;
    TriggerIcon: React.FC<React.SVGProps<SVGSVGElement>>;
};

const POPOVER_HEIGHT = 220;

function ColumnPicker<T>({
    title,
    availableColumns,
    selectedIds,
    onChange,
}: Props<T>) {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const [open, setOpen] = useState(false);
    const [showAbove, setShowAbove] = useState(false);
    const [positionReady, setPositionReady] = useState(false);

    useOnClickOutside(popoverRef, () => setOpen(false));

    const toggles = useMemo(
        () => availableColumns.filter((c) => !c.locked),
        [availableColumns]
    );

    const defaultSelected = useMemo(
        () => toggles.filter((c) => c.defaultVisible).map((c) => c.id),
        [toggles]
    );
    const [sel, setSel] = useState<Set<ColumnId>>(
        new Set(selectedIds ?? defaultSelected)
    );

    const toggleOptions = toggles.map((c) => c.id).join('|');

    useEffect(() => {
        setSel(new Set(selectedIds ?? defaultSelected));
    }, [selectedIds, defaultSelected, toggleOptions]);

    const toggle = useCallback(
        (id: ColumnId) => {
            const next = new Set(sel);
            next.has(id) ? next.delete(id) : next.add(id);
            setSel(next);
            onChange(Array.from(next));
        },
        [sel, onChange]
    );

    const getShouldShowAbove = (
        triggerEl: HTMLElement,
        estimatedHeight: number
    ): boolean => {
        const tbody = triggerEl.closest('tbody');
        const triggerRect = triggerEl.getBoundingClientRect();

        if (tbody) {
            const tbodyRect = (tbody as HTMLElement).getBoundingClientRect();
            const spaceBelow = tbodyRect.bottom - triggerRect.bottom;
            const spaceAbove = triggerRect.top - tbodyRect.top;
            return spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
        }

        // fallback: use window viewport
        const spaceBelow = window.innerHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;
        return spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
    };

    useEffect(() => {
        if (!open) {
            setPositionReady(false);
            return;
        }

        if (!buttonRef.current) return;

        setShowAbove(getShouldShowAbove(buttonRef.current, POPOVER_HEIGHT));
        setPositionReady(true);
    }, [open]);

    const handleToggleOpen = useCallback(() => setOpen((prev) => !prev), []);

    const labelOf = (col: Column<any>) => (t(col.label) as string) || col.label;

    return (
        <div className={styles.root}>
            <Button
                ref={buttonRef}
                size="small"
                aria-label={title}
                onClick={handleToggleOpen}
                className={styles.triggerButton}
            >
                <SettingsIcon
                    className={styles.settingsIcon}
                    width={24}
                    height={24}
                />
            </Button>

            {open && positionReady && (
                <div
                    ref={popoverRef}
                    className={`${styles.popover} ${
                        showAbove ? styles.popoverAbove : styles.popoverBelow
                    }`}
                    role="menu"
                    aria-label={title}
                >
                    <div className={styles.popoverTitle}>{title}</div>

                    <div className={styles.options}>
                        {toggles.map((col) => {
                            const checked = sel.has(col.id);
                            return (
                                <button
                                    key={col.id}
                                    onClick={() => toggle(col.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            toggle(col.id);
                                        }
                                    }}
                                    className={styles.optionButton}
                                    role="menuitemcheckbox"
                                    aria-checked={checked}
                                    tabIndex={0}
                                >
                                    <span className={styles.optionLabel}>
                                        {labelOf(col)}
                                    </span>
                                    {checked ? (
                                        <CheckIcon
                                            width={20}
                                            height={20}
                                            className={styles.checkedIcon}
                                        />
                                    ) : (
                                        <span
                                            className={styles.iconPlaceholder}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ColumnPicker;
