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
import { useEffect, useState, ChangeEvent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
    groupSectionsForPolicy,
    excludeNodesByLabel,
    searchNodes,
    addToolTips,
    excludeNodesByCarrierRules,
    groupBasicsForPolicy,
} from '@deps/components/find-key-values-sidesheet/transformations';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { filterAppliedTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { useDebounce } from '@deps/hooks/useDebounce';
import { usePolicyQuery } from '@deps/hooks/usePolicyQuery';
import { Expand, useTreeState } from '@deps/hooks/useTreeState';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';

import { DataNodeRenderer } from '../components/data-node-renderer';
import { convertNode } from '../data-node-helpers/mutations';
import { applyTransformationsToNodes } from '../data-node-helpers/mutations';
import styles from '../find-all-key-values-sidesheet.module.css';
import { FindAllKeyValuesSidebarProps } from '../types';

export const PolicySidesheetContent = ({
    planCode,
    policyNumber,
    container,
    handleCalendarOpen,
}: FindAllKeyValuesSidebarProps) => {
    const [date, setDate] = useState('');
    const { treeState, setTreeState, searchValue, setSearchValue } =
        useTreeState();
    const [fieldError, setFieldError] = useState(false);
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

    console.log('.....first step of convertions......', convertNode(policy, t));
    const lineOfBusiness = policy?.product?.lineOfBusiness;
    const productType = policy?.product?.productType;
    const nomenclature =
        lineOfBusiness === LineOfBusiness.LIFE
            ? t('policy.nomenclature.policy')
            : t('policy.nomenclature.contract');
    const nodes = useMemo(
        () =>
            applyTransformationsToNodes(
                (data) => convertNode(data, t),
                (data) => groupBasicsForPolicy(data),
                (data) => addToolTips(data, t),
                (data) =>
                    groupSectionsForPolicy({
                        nodes: data,
                        t,
                        planCode,
                        policyNumber,
                    }),
                (data) =>
                    excludeNodesByCarrierRules({
                        nodes: data,
                        lineOfBusiness,
                        productType,
                        planCode,
                    }),
                (data) => excludeNodesByLabel(data, t, nomenclature)
            )(policy),
        [policy, t, planCode, policyNumber]
    );

    const matches = useMemo(
        () => searchNodes(nodes, debouncedSearchValue),
        [nodes, debouncedSearchValue]
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
        setSearchValue(debouncedSearchValue);
    }, [
        debouncedSearchValue,
        authSessionId,
        planCode,
        policyNumber,
        setTreeState,
        setSearchValue,
    ]);

    if (!nodes || !policy) return null; //TODO: DEPU-XXXX add loading state
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
                onDateSelect={(date: Date | undefined) =>
                    handleDateChange(date)
                }
                container={container}
                fieldStatus={fieldError ? FieldStatus.ERROR : undefined}
                formatErrorMsg={t('allFields.invalidDateFormat') || ''}
                rangeErrorMsg={rangeErrorMsg}
                handleCalendarOpen={handleCalendarOpen}
            />
            <FieldData
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSearchValue(e.target.value)
                }
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
                    <DataNodeRenderer nodes={matches} />
                    {!matches.length && (
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
