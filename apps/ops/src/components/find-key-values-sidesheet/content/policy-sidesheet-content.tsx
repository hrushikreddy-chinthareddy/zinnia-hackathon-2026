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
    groupBasicsForPolicy,
} from '@deps/components/find-key-values-sidesheet/transformations/section-grouping';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { filterAppliedTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { useDebounce } from '@deps/hooks/useDebounce';
import { usePolicyQuery } from '@deps/hooks/usePolicyQuery';
import { Expand, useTreeState } from '@deps/hooks/useTreeState';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';
import { Product } from '@zinnia/api-types/types/sor';

import { DataNodesRenderer } from '../components/data-node-renderer';
import {
    applyTransformationsToNodes,
    buildRenderTreeFromSourceData,
    transformNodes,
} from '../data-node-helpers/mutations';
import styles from '../find-all-key-values-sidesheet.module.css';
import { addToolTip, formatNode } from '../transformations/formatters';
import {
    excludeNodeByCarrierRules,
    excludeNodeByLabel,
    searchNodes,
} from '../transformations/node-visibility';
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
    const lineOfBusiness = policy?.product?.lineOfBusiness;
    const productType = policy?.product?.productType;
    const policyNomenclature =
        lineOfBusiness === Product.lineOfBusiness.LIFE
            ? t('policy.nomenclature.policy')
            : t('policy.nomenclature.contract');

    const policyNodes = useMemo(
        () =>
            // Chains transformations for the entire tree
            applyTransformationsToNodes(
                // buildRenderTreeFromSourceData will take an arbitrary data structure, and
                // convert it into a structure that can be rendered
                // Full docs here: https://zinnia.atlassian.net/wiki/spaces/AU/pages/5738889232/Rendering+Data+Trees
                (nodes) => buildRenderTreeFromSourceData(nodes, t),
                (nodes) => groupBasicsForPolicy(nodes), // Groups all top-level DataField nodes into a section
                (nodes) =>
                    // Groups various data into sections, as defined by Policy FKV business rules
                    groupSectionsForPolicy({
                        nodes,
                        t,
                        planCode,
                        policyNumber,
                    }),
                (nodes) =>
                    // Transforms the entire tree, chaining transformations on *each node*
                    transformNodes({
                        nodes,
                        transforms: [
                            (node) =>
                                // Excludes sections and fields that are required to be hidden specifically by carrier/product
                                excludeNodeByCarrierRules({
                                    node,
                                    lineOfBusiness,
                                    productType,
                                    planCode,
                                }),
                            (node) =>
                                // Excludes sections and fields that are required to be hidden across all data
                                excludeNodeByLabel({
                                    node,
                                }),
                            (node) =>
                                // Adds a tooltip to the node if it exists in the tooltip mapping
                                addToolTip({
                                    node,
                                    t,
                                    policyNomenclature,
                                }),
                            (node) =>
                                // Applies translations and formats dates, currencies, etc.
                                formatNode({
                                    node,
                                    t,
                                    policyNomenclature,
                                }),
                        ],
                    })
            )(policy),
        [
            policy,
            t,
            planCode,
            policyNumber,
            lineOfBusiness,
            policyNomenclature,
            productType,
        ]
    );

    const matches = useMemo(
        () => searchNodes(policyNodes, debouncedSearchValue),
        [policyNodes, debouncedSearchValue]
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
                                ? t('allFields.collapseAll')
                                : t('allFields.expandAll')}
                        </Button>
                    </div>
                    <DataNodesRenderer nodes={matches} />
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
