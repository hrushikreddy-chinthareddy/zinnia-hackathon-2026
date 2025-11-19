import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Policy } from '@xd/api-types/dist/generated-types/sor';
import { Accordion } from '@xd/components/Accordion/Accordion';
import useDebounce from '@xd/xd-components/src/hooks/useDebounce';
import {
    SideSheet,
    Icon,
    IconType,
    Button,
    PopoverPlacement,
    FieldData,
    FieldTypes,
    FieldSize as BloomFieldSize,
} from '@zinnia/bloom/components';
import dayjs, { Dayjs } from 'dayjs';
import { ChangeEvent, FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { filterOnSearchHandler } from '@deps/helpers/search.helpers';
import {
    getPolicyQueryKey,
    getPolicyQuery,
} from '@deps/queries/tanstack/policyQueries/policyQueries';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';

import styles from './find-key-values-sidesheet.module.css';
import { generateKeyValueGroups, prepareSearchableData } from './utils';
import DotContainer from '../dot-container/dot-container';
import { FieldSize, FieldType, FieldVariant } from '../fields/field';
import FieldDateSelect, {
    DATE_PICKER_FORMAT,
} from '../fields/field-date-select/field-date-select';
import Highlighter from '../highlighter/highlighter';
import { BlurOverlayLoader } from '../overlay-loader/overlay-loader';
import Popover from '../popover/popover';

interface FindKeyValuesSidebarProps {
    planCode?: string;
    policyNumber?: string;
}

//TODO: remove once FindAllKeyValuesSidesheet is enabled for all users
export const FindKeyValuesSidesheet: FC<FindKeyValuesSidebarProps> = ({
    planCode,
    policyNumber,
}) => {
    const [date, setDate] = useState('');
    const [fieldError, setFieldError] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const queryClient = useQueryClient();
    const [enableQuery, setEnableQuery] = useState(false);
    const { t } = useTranslation();

    const {
        data: policy,
        isFetching,
        isError,
    } = useQuery({
        queryKey: [getPolicyQueryKey, policyNumber, planCode, date],
        queryFn: () =>
            getPolicyQuery(
                policyNumber as string,
                planCode as string,
                dayjs(date, DATE_PICKER_FORMAT).format('YYYY-MM-DD')
            ),
        placeholderData: () => {
            const initialData = queryClient.getQueryData<Policy>([
                getPolicyQueryKey,
                policyNumber,
                planCode,
            ]);
            return initialData;
        },
        enabled: enableQuery,
    });

    const isDateAllowed = (date: Dayjs) => {
        const policyIssuanceDate = dayjs(
            policy?.policyDates?.issueDate as string
        );
        return date.isBetween(policyIssuanceDate, dayjs(), 'day', '[]');
    };

    const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        // if value isnt a number, early return
        const numberRegex = /^\d+$/;
        if (!numberRegex.test(e.target.value)) {
            return;
        }
        const day = dayjs(e.target.value, NUMERIC_DATE_FORMAT);

        if (day.isValid() && isDateAllowed(day)) {
            setDate(day.format(NUMERIC_DATE_FORMAT));
            setEnableQuery(true);
            setFieldError(false);
        } else {
            setDate(e.target.value);
            setEnableQuery(false);
            setFieldError(true);
        }
    };

    // Generate the key values for the policy
    const keyValues = useMemo(
        () => prepareSearchableData(policy ?? {}, t),
        [policy, t]
    );

    const debouncedSearchValue = useDebounce(searchValue, 200);

    // When user searches, filter down the key values
    const filteredKeys = useMemo(() => {
        return filterOnSearchHandler(keyValues, {
            searchValue: debouncedSearchValue,
        });
    }, [keyValues, debouncedSearchValue]);

    // Group up the key values to render in the accordions
    const keyValuesByGroup = useMemo(
        () => generateKeyValueGroups(filteredKeys),
        [filteredKeys]
    );

    return (
        <SideSheet
            trigger={
                <Button mode="secondary" size="small">
                    <Icon type={IconType.DOCUMENT_TEXT} />
                    {t('label.findKeyValuesTitle')}
                </Button>
            }
            header={
                <span className="typography-desktop-headline-2-d">
                    {t('label.findKeyValuesTitle')}
                </span>
            }
        >
            <div className={styles.keyValuesContainer}>
                <FieldDateSelect
                    label={t('label.findKeyValuesDate') as string}
                    className={styles.datePicker}
                    id="start-date"
                    isFutureDateDisabled={true}
                    onChange={handleDateChange}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    message={
                        fieldError || isError
                            ? (t('label.findKeyValuesDateError') as string)
                            : ''
                    }
                    variant={
                        fieldError || isError
                            ? FieldVariant.Error
                            : FieldVariant.Default
                    }
                    value={date || dayjs().format(NUMERIC_DATE_FORMAT)}
                    showMonths={true}
                    isDateAllowed={isDateAllowed}
                />

                <FieldData
                    onChange={(e) => setSearchValue(e.target.value)}
                    handleClear={() => setSearchValue('')}
                    value={searchValue}
                    fieldType={FieldTypes.Search}
                    fieldSize={BloomFieldSize.Small}
                    placeholder="Search"
                />

                <BlurOverlayLoader
                    loading={fieldError || isFetching || isError}
                >
                    <div className={styles.container}>
                        {keyValuesByGroup.map((group) => (
                            <Accordion
                                key={group.groupLabel}
                                sectionLabel={group.groupLabel}
                            >
                                <div className={styles.itemsList}>
                                    {group.items.map((item) => (
                                        <DotContainer
                                            key={item.label}
                                            dotLeftSide={
                                                <div>
                                                    <Highlighter
                                                        text={item.label}
                                                        highlights={[
                                                            searchValue,
                                                        ]}
                                                    />
                                                    {item.tooltip && (
                                                        <Popover
                                                            placement={
                                                                PopoverPlacement.TopRight
                                                            }
                                                            title={item.tooltip}
                                                            body={
                                                                item.tooltipBody
                                                            }
                                                        >
                                                            <CircleInfoIcon
                                                                height={'16px'}
                                                                width={'16px'}
                                                                className="tooltip-primary"
                                                            />
                                                        </Popover>
                                                    )}
                                                </div>
                                            }
                                            dotLeftSideClassName="typography-content-body-sm"
                                            dotRightSide={item.value}
                                            dotRightSideClassName="typography-content-body-sm"
                                        />
                                    ))}
                                </div>
                            </Accordion>
                        ))}
                    </div>
                </BlurOverlayLoader>
            </div>
        </SideSheet>
    );
};
