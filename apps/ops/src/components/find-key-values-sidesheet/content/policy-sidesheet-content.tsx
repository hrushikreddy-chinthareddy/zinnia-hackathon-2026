import { useQueryClient } from '@tanstack/react-query';
import {
    Button,
    FieldData,
    FieldSize,
    FieldTypes,
    Icon,
    IconType,
    Label,
    FieldSize as BloomFieldSize,
} from '@zinnia/bloom/components';
import dayjs, { Dayjs } from 'dayjs';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FieldType, FieldVariant } from '@deps/components/fields/field';
import FieldDateSelect from '@deps/components/fields/field-date-select/field-date-select';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { filterAppliedTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { useDebounce } from '@deps/hooks/useDebounce';
import { usePolicyQuery } from '@deps/hooks/usePolicyQuery';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';

import { KeyValueBasics } from '../components/key-value-basics';
import { KeyValueSections } from '../components/key-value-sections';
import styles from '../find-all-key-values-sidesheet.module.css';
import { preparePolicy } from '../transformations';
import {
    Collapse,
    Expand,
    FindAllKeyValuesSidebarProps,
    NestedData,
} from '../types';

export const PolicySidesheetContent = ({
    planCode,
    policyNumber,
}: FindAllKeyValuesSidebarProps) => {
    const [date, setDate] = useState('');
    const [treeState, setTreeState] = useState(Collapse);
    const [fieldError, setFieldError] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const queryClient = useQueryClient();
    const [enableQuery, setEnableQuery] = useState(false);
    const { t } = useTranslation();
    const { sessionId: authSessionId } = usePermissionsContext();

    const { policy, isFetching, isError } = usePolicyQuery(
        planCode,
        policyNumber,
        date,
        queryClient,
        enableQuery
    );

    const isDateAllowed = (date: Dayjs) => {
        const policyIssuanceDate = dayjs(
            policy?.policyDates?.issueDate as string
        );
        return (
            date.isAfter(policyIssuanceDate) &&
            date.isBefore(dayjs().add(1, 'day'))
        );
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

    const debouncedSearchValue = useDebounce(searchValue, 200);

    // This retains all the persistent extracted data on the policy
    const preparedPolicy = useMemo(
        () =>
            policy
                ? preparePolicy({
                      policy,
                      t,
                      searchValue: debouncedSearchValue,
                  })
                : null,
        [policy, debouncedSearchValue, t]
    );

    const { policyBasics, policySections } = useMemo(
        () =>
            preparedPolicy
                ? preparedPolicy.toSections()
                : {
                      policyBasics: null,
                      policySections: null,
                  },
        [preparedPolicy]
    );

    // If the search value changes to non-empty, expand the tree
    // (the tree will be cropped to matching search results)
    useEffect(() => {
        if (!debouncedSearchValue) return;
        filterAppliedTrackEvent({
            filterValue: debouncedSearchValue,
            filterTarget: 'Find Key Values',
            authSessionId: authSessionId,
            policyId: policyNumber,
            planCode: planCode,
        });
        setTreeState(Expand);
    }, [debouncedSearchValue, authSessionId, planCode, policyNumber]);

    if (!preparedPolicy) return null; //FIXME: add loading state
    return (
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

            <BlurOverlayLoader loading={fieldError || isFetching || isError}>
                <div className={styles.container}>
                    <div className={styles.treeControl}>
                        <Button
                            mode="link"
                            size="small"
                            onClick={() =>
                                setTreeState((treeState) => !treeState)
                            }
                            className={styles.treeControlButton}
                        >
                            <Icon
                                type={IconType.CHEVRON_DOUBLE}
                                width={18}
                                height={18}
                                className={styles.treeControlIcon}
                            />
                            {treeState === Expand
                                ? 'Collapse all'
                                : 'Expand all'}
                        </Button>
                    </div>
                    {policyBasics && (
                        <KeyValueBasics
                            preparedData={preparedPolicy}
                            policyBasics={policyBasics as NestedData[]}
                            searchValue={searchValue}
                            treeState={treeState}
                        />
                    )}

                    {!!policySections?.length && (
                        <KeyValueSections
                            preparedData={preparedPolicy}
                            sections={policySections}
                            searchValue={searchValue}
                            treeState={treeState}
                        />
                    )}

                    {!policyBasics && !policySections?.length && (
                        <div className={styles.emptySearch}>
                            <Label>
                                <Icon
                                    type={IconType.CIRCLE_INFO}
                                    small={true}
                                    className={styles.infoIcon}
                                />
                                {t('policy.allFields.emptySearch')}
                            </Label>
                        </div>
                    )}
                </div>
            </BlurOverlayLoader>
        </div>
    );
};
