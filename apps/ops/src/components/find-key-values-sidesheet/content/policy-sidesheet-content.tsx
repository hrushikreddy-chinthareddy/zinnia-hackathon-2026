import { useQueryClient } from '@tanstack/react-query';
import {
    Button,
    FieldData,
    FieldTypes,
    Icon,
    IconType,
    Label,
    FieldSize as BloomFieldSize,
    FieldDateSingle,
    FieldStatus,
} from '@zinnia/bloom/components';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

export const PolicySidesheetContent = ({
    planCode,
    policyNumber,
    container,
    handleCalendarOpen,
}: FindAllKeyValuesSidebarProps) => {
    const [date, setDate] = useState('');
    const [treeState, setTreeState] = useState(Collapse);
    const [fieldError, setFieldError] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const queryClient = useQueryClient();
    const [enableQuery, setEnableQuery] = useState(false);
    const { t } = useTranslation();
    const { sessionId: authSessionId } = usePermissionsContext();
    const {
        data: policy,
        isFetching,
        isError,
    } = usePolicyQuery(planCode, policyNumber, date, queryClient, enableQuery);
    const rangeErrorMsg = `${t('allFields.selectDateInRange')} ${dayjs(
        policy?.policyDates?.issueDate
    ).format('L')} - ${dayjs().format('L')}`;

    const isDateAllowed = (date: Dayjs) => {
        const policyIssuanceDate = dayjs(
            policy?.policyDates?.issueDate as string
        );
        return date.isBetween(dayjs(policyIssuanceDate), dayjs(), 'day', '[]');
    };

    const handleDateChange = (date?: Date) => {
        if (date === undefined) {
            return;
        }

        const day = dayjs(date);

        if (day.isValid() && isDateAllowed(day)) {
            setDate(day.format(NUMERIC_DATE_FORMAT));
            setEnableQuery(true);
            setFieldError(false);
        } else {
            setDate(date.toString());
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

    const { basics, sections } = useMemo(
        () =>
            preparedPolicy
                ? preparedPolicy.toSections()
                : {
                      basics: null,
                      sections: null,
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

    if (!preparedPolicy) return null; //TODO: DEPU-XXXX add loading state
    return (
        <div className={styles.keyValuesContainer}>
            <FieldDateSingle
                name={'select-date'}
                label={
                    <Label labelFor="select-date">
                        {t('label.findKeyValuesDate') || ''}
                    </Label>
                }
                disableAfterDate={new Date()}
                disableBeforeDate={
                    new Date(policy?.policyDates?.issueDate || '')
                }
                defaultDate={new Date()}
                onDateSelect={(date) => handleDateChange(date)}
                container={container}
                fieldStatus={fieldError ? FieldStatus.ERROR : undefined}
                formatErrorMsg={t('allFields.invalidDateFormat') || ''}
                rangeErrorMsg={rangeErrorMsg}
                handleCalendarOpen={handleCalendarOpen}
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
                    {basics && (
                        <KeyValueBasics
                            policyBasics={basics as NestedData[]}
                            searchValue={searchValue}
                            treeState={treeState}
                        />
                    )}

                    {!!sections?.length && (
                        <KeyValueSections
                            preparedData={preparedPolicy}
                            sections={sections}
                            searchValue={searchValue}
                            treeState={treeState}
                        />
                    )}

                    {!basics && !sections?.length && (
                        <div className={styles.emptySearch}>
                            <Label>
                                <Icon
                                    type={IconType.CIRCLE_INFO}
                                    small={true}
                                    className={styles.infoIcon}
                                />
                                {t('allFields.emptySearch')}
                            </Label>
                        </div>
                    )}
                </div>
            </BlurOverlayLoader>
        </div>
    );
};
