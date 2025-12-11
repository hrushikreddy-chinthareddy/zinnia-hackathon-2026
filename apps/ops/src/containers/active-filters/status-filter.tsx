import { Button } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useRef, useState } from 'react';

import ChipStatus from '@deps/components/chip-status/chip-status';
import { TextButton } from '@deps/components/quick-actions-menu/quick-action-text-button';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { Statuses } from '@deps/models/case/case';
import {
    DropdownClickedEvent,
    SegmentTrackedEventName,
} from '@deps/types/segment-analytics';

import styles from './status-filter.module.css';

interface StatusChipProps {
    displayText: string;
    value: string;
    isSelected: boolean;
    onClick: (value: string, displayText: string) => void;
    total: string;
    tabIndex: number;
    onKeyDown: (event: React.KeyboardEvent, value: string) => void;
}

const StatusChip = ({
    value,
    isSelected,
    onClick,
    displayText,
    total,
    tabIndex,
    onKeyDown,
}: StatusChipProps) => {
    const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const handleClick = () => {
        onClick(value, displayText);
    };

    const handleKeyDownInternal = (event: React.KeyboardEvent) => {
        onKeyDown(event, value);
    };

    const chipClasses = [
        styles.statusChip,
        isSelected ? styles.statusChipSelected : styles.statusChipUnselected,
    ].join(' ');

    const refHandler = (el: HTMLButtonElement | null) => {
        chipRefs.current[value] = el;
    };
    return (
        <Button
            ref={refHandler}
            onClick={handleClick}
            onKeyDown={handleKeyDownInternal}
            className={chipClasses}
            tabIndex={tabIndex}
            aria-pressed={isSelected ? 'true' : 'false'}
            aria-label={`${displayText}, ${total} cases`}
            role="radio"
        >
            <div>
                {value === Statuses.All ? (
                    <div className="font-bold">{displayText}</div>
                ) : (
                    <ChipStatus status={value} statusText={displayText} />
                )}
            </div>
            <div className={styles.casesContainer}>
                <div className={styles.totalCases}>{total}</div>
                <div className={styles.casesLabel}>Cases</div>
            </div>
        </Button>
    );
};

export default function StatusFilter({
    caseTotals = {},
    onChange,
    sessionId,
    userId,
    values = [],
}: {
    caseTotals?: { [key: string]: number };
    values?: Statuses[];
    onChange: (values: Statuses[]) => void;
    sessionId: string;
    userId: string;
}) {
    const { t } = useTranslation();
    const statusOptions = useMemo(
        () => [
            {
                total: (caseTotals[Statuses.All] ?? 0).toLocaleString(),
                displayText: t('status.all'),
                value: Statuses.All,
            },
            {
                total: (caseTotals[Statuses.InProgress] ?? 0).toLocaleString(),
                displayText: t('status.inProgress'),
                value: Statuses.InProgress,
            },
            {
                total: (caseTotals[Statuses.Completed] ?? 0).toLocaleString(),
                displayText: t('status.completed'),
                value: Statuses.Completed,
            },
            {
                total: (caseTotals[Statuses.Exception] ?? 0).toLocaleString(),
                displayText: t('status.exception'),
                value: Statuses.Exception,
            },
            {
                total: (caseTotals[Statuses.Canceled] ?? 0).toLocaleString(),
                displayText: t('status.canceled'),
                value: Statuses.Canceled,
            },
        ],
        [caseTotals, t]
    );

    const [selected, setSelected] = useState<{ [key: string]: string }>(
        statusOptions.reduce((acc, option) => {
            if (values.includes(option.value as Statuses)) {
                return { ...acc, [option.value]: option.displayText };
            } else return acc;
        }, {})
    );

    const [showMore, setShowMore] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const mobileBreakpoint = 767;
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= mobileBreakpoint);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    useEffect(() => {
        const newSelected = statusOptions.reduce((acc, option) => {
            if (values.includes(option.value as Statuses)) {
                return { ...acc, [option.value]: option.displayText };
            } else return acc;
        }, {});

        const prevSelected = new Set(Object.keys(selected));
        const newSelectedSet = new Set(Object.keys(newSelected));
        newSelectedSet.forEach((val) => {
            if (prevSelected.has(val)) {
                prevSelected.delete(val);
                newSelectedSet.delete(val);
            }
        });

        if (prevSelected.size !== 0 || newSelectedSet.size !== 0) {
            setSelected(newSelected);
        }
    }, [values]);

    const handleSelection = (selectedValue: string, displayText: string) => {
        setSelected((prev) => {
            const newSelections = { ...prev };
            if (newSelections[selectedValue]) {
                delete newSelections[selectedValue];
            } else {
                newSelections[selectedValue] = displayText;
            }

            segmentAnalyticsTrackEvent<DropdownClickedEvent>(
                SegmentTrackedEventName.DropdownClicked,
                {
                    dropdownName: 'Case Status Filter',
                    selectedItemName:
                        Object.keys(newSelections)
                            .filter((key) => newSelections[key])
                            .reduce((acc, key, index, array) => {
                                const option = statusOptions.find(
                                    (opt) => opt.value === key
                                );
                                return `${acc}${option?.value || key}${
                                    index < array.length - 1 ? ', ' : ''
                                }`;
                            }, '') || 'All',
                    authSessionId: sessionId,
                    userId,
                }
            );

            return newSelections;
        });
    };

    const handleKeyDown = (event: React.KeyboardEvent, value: string) => {
        const currentIndex = statusOptions.findIndex(
            (option) => option.value === value
        );

        switch (event.key) {
            case 'Enter':
            case ' ': {
                event.preventDefault();
                const option = statusOptions.find((opt) => opt.value === value);
                if (option) {
                    handleSelection(value, option.displayText);
                }
                break;
            }

            case 'ArrowRight':
            case 'ArrowDown': {
                event.preventDefault();
                const nextIndex = (currentIndex + 1) % statusOptions.length;
                const nextChip =
                    chipRefs.current[statusOptions[nextIndex].value];
                nextChip?.focus();
                break;
            }

            case 'ArrowLeft':
            case 'ArrowUp': {
                event.preventDefault();
                const prevIndex =
                    currentIndex === 0
                        ? statusOptions.length - 1
                        : currentIndex - 1;
                const prevChip =
                    chipRefs.current[statusOptions[prevIndex].value];
                prevChip?.focus();
                break;
            }

            case 'Home': {
                event.preventDefault();
                const firstChip = chipRefs.current[statusOptions[0].value];
                firstChip?.focus();
                break;
            }

            case 'End': {
                event.preventDefault();
                const lastChip =
                    chipRefs.current[
                        statusOptions[statusOptions.length - 1].value
                    ];
                lastChip?.focus();
                break;
            }
        }
    };

    useEffect(() => {
        const statusValues = Object.keys(selected).filter(
            (key) => selected[key]
        ) as Statuses[];
        const individualStatuses = [
            Statuses.InProgress,
            Statuses.Exception,
            Statuses.Completed,
            Statuses.Canceled,
        ];
        const isAllSelected =
            statusValues.includes(Statuses.All) ||
            individualStatuses.every((status) => statusValues.includes(status));

        const processedStatusValues = isAllSelected
            ? []
            : statusValues.filter((status) => status !== Statuses.All);

        onChange(processedStatusValues);
    }, [selected]);

    const selectedOptions = statusOptions.filter(
        (option) =>
            selected[option.value] ||
            (Object.keys(selected).length === 0 &&
                option.value === Statuses.All)
    );
    const unselectedOptions = statusOptions.filter(
        (option) =>
            !selected[option.value] &&
            !(
                Object.keys(selected).length === 0 &&
                option.value === Statuses.All
            )
    );

    const toggleShowMore = () => {
        setShowMore(!showMore);
    };

    const handleShowMoreKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleShowMore();
        }
    };

    const renderStatusChips = (options: typeof statusOptions) => {
        return options.map((option) => (
            <StatusChip
                key={option.value}
                displayText={option.displayText}
                value={option.value}
                isSelected={
                    Object.keys(selected).length === 0
                        ? option.value === Statuses.All
                        : !!selected[option.value]
                }
                onClick={handleSelection}
                onKeyDown={handleKeyDown}
                total={option.total}
                tabIndex={0}
            />
        ));
    };

    const renderButton = () => {
        return (
            <div
                className={
                    showMore
                        ? styles.showLessContainer
                        : styles.showMoreContainer
                }
            >
                <Button
                    onClick={toggleShowMore}
                    onKeyDown={handleShowMoreKeyDown}
                    tabIndex={0}
                    role="button"
                    aria-label={String(
                        showMore ? t('button.showLess') : t('button.showAll')
                    )}
                    data-state={showMore ? 'open' : 'closed'}
                    className="group"
                >
                    <TextButton
                        label={
                            showMore
                                ? t('button.showLess')
                                : t('button.showAll')
                        }
                        chevronPosition="start"
                    />
                </Button>
            </div>
        );
    };

    return (
        <button
            className={styles.statusFilterContainer}
            role="toolbar"
            aria-label="Case status filters"
        >
            {isMobile ? (
                <>
                    {!showMore && renderStatusChips(selectedOptions)}
                    {!showMore &&
                        unselectedOptions.length > 0 &&
                        renderButton()}
                    {showMore && renderStatusChips(statusOptions)}
                    {showMore && renderButton()}
                </>
            ) : (
                renderStatusChips(statusOptions)
            )}
        </button>
    );
}
