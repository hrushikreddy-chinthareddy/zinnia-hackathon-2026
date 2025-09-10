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
    Link,
} from '@zinnia/bloom/components';
import dayjs, { Dayjs } from 'dayjs';
import { ChangeEvent, FC, useMemo, useState, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { filterOnSearchHandler } from '@deps/helpers/search.helpers';
import {
    getPolicyQueryKey,
    getPolicyQuery,
} from '@deps/queries/tanstack/policyQueries/policyQueries';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';

import styles from './find-key-values-sidesheet.module.css';
import { preparePolicy } from './transformations';
import {
    DataRecord,
    DataTuple,
    label,
    link,
    linkedField,
    MetaData,
    tags,
} from './types';
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

const DataField = ({
    label,
    data,
    searchValue,
}: {
    label: string;
    data: string | ReactElement;
    searchValue: string;
}) => {
    if (data == null) return null;
    return (
        <DotContainer
            key={label}
            dotLeftSide={
                <div>
                    <Highlighter text={label} highlights={[searchValue]} />
                    {/* FIXME: add tooltip
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
                                className="text-primary"
                            />
                        </Popover>
                    )}
                    */}
                </div>
            }
            dotLeftSideClassName="typography-content-body-sm"
            dotRightSide={data}
            dotRightSideClassName="typography-content-body-sm"
        />
    );
};

const FindAllKeyValuesNestedSubSection = ({
    preparedPolicy,
    fields,
    searchValue,
}: {
    preparedPolicy: ReturnType<typeof preparePolicy>;
    fields: DataRecord[];
    searchValue: string;
}) => {
    //console.log('|-------->fields', fields);
    return fields.map((field, i) => {
        const fieldLabel = field[label];
        if (fieldLabel == null) return null;
        const fieldTags = field[tags] as string[];
        const fieldLink = field[link] as string;
        const fieldLinkField = field[linkedField] as string;
        //console.log('|-------->fieldLink', fieldLink, fieldLinkField);
        return (
            <div className={styles.subSection}>
                <Accordion
                    key={String(fieldLabel)}
                    sectionLabel={preparedPolicy.formatAsSectionLabel(
                        String(fieldLabel)
                    )}
                    tags={fieldTags}
                >
                    <div className={styles.itemsList}>
                        {Object.entries(field).map((dataField) => {
                            const formattedField =
                                preparedPolicy.formatDataField(dataField);
                            if (!formattedField) return null;
                            const [fieldLabel, fieldData] = formattedField;
                            const linkedField =
                                fieldLink && fieldLinkField === dataField[0] ? (
                                    <Link href={fieldLink} text={fieldData} />
                                ) : undefined;
                            return (
                                <DataField
                                    key={fieldLabel}
                                    label={fieldLabel}
                                    data={linkedField ?? fieldData}
                                    searchValue={searchValue}
                                />
                            );
                        })}
                    </div>
                </Accordion>
            </div>
        );
    });
};

const FindAllKeyValuesSection = ({
    preparedPolicy,
    fields,
    searchValue,
    metaData,
}: {
    preparedPolicy: ReturnType<typeof preparePolicy>;
    fields: DataTuple[];
    searchValue: string;
    metaData?: MetaData;
}) => {
    return (
        <div className={styles.itemsList}>
            {fields.map((field) => {
                // If the field data is an array, render it as a
                // subSection-in-subSection
                const [, unformattedData] = field;
                if (unformattedData instanceof Array) {
                    return (
                        <FindAllKeyValuesNestedSubSection
                            preparedPolicy={preparedPolicy}
                            fields={unformattedData as DataRecord[]}
                            searchValue={searchValue}
                        />
                    );
                }

                // Otherwise, just render it as a DataField
                const formattedField = preparedPolicy.formatDataField(field);
                if (!formattedField) return null;
                const [fieldLabel, fieldData] = formattedField;
                const fieldLink =
                    metaData?.[link] && metaData?.[linkedField] === field[0] ? (
                        <Link href={metaData?.[link]} text={fieldData} />
                    ) : undefined;
                return (
                    <DataField
                        label={fieldLabel}
                        data={fieldLink ?? fieldData}
                        searchValue={searchValue}
                    />
                );
            })}
        </div>
    );
};

export const FindAllKeyValuesSidesheet: FC<FindKeyValuesSidebarProps> = ({
    planCode,
    policyNumber,
}) => {
    const [date, setDate] = useState('');
    const [fieldError, setFieldError] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const queryClient = useQueryClient();
    const [enableQuery, setEnableQuery] = useState(false);
    const { t } = useTranslation();

    // TODO: abstract to custom hook
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

    /*
    const debouncedSearchValue = useDebounce(searchValue, 200);

    // When user searches, filter down the key values
    const filteredKeys = useMemo(() => {
        return filterOnSearchHandler(keyValues, {
            searchValue: debouncedSearchValue,
        });
    }, [keyValues, debouncedSearchValue]);

    */

    if (!policy) return null; //FIXME: add loading state

    // This retains all the persistent extracted data on the policy
    const preparedPolicy = useMemo(() => preparePolicy(policy), [policy]);

    const { policyBasics, policySections } = useMemo(
        () => preparedPolicy.toSections(),
        [preparedPolicy]
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
                        {/* FIXME: i18n */}
                        <Accordion
                            key="policyBasics"
                            sectionLabel={preparedPolicy.formatAsSectionLabel(
                                'Policy basics'
                            )}
                        >
                            <FindAllKeyValuesSection
                                preparedPolicy={preparedPolicy}
                                fields={policyBasics}
                                searchValue={searchValue}
                            />
                        </Accordion>

                        {policySections.map(([sectionLabel, sectionData]) => {
                            const { fields, subSections } =
                                preparedPolicy.toFieldsAndSubsections([
                                    sectionLabel,
                                    sectionData,
                                ]);

                            console.log(
                                'Subsections',
                                sectionLabel,
                                subSections
                            );
                            if (
                                typeof sectionLabel !== 'string' ||
                                subSections == null
                            ) {
                                return null;
                            }
                            return (
                                <Accordion
                                    key={sectionLabel}
                                    sectionLabel={preparedPolicy.formatAsSectionLabel(
                                        sectionLabel
                                    )}
                                >
                                    {fields && (
                                        <FindAllKeyValuesSection
                                            preparedPolicy={preparedPolicy}
                                            fields={fields}
                                            searchValue={searchValue}
                                        />
                                    )}
                                    {subSections?.map(
                                        ([
                                            subSectionLabel,
                                            subSectionFields,
                                            subSectionMetaData,
                                        ]) => {
                                            //console.log('in subsection...', subSectionLabel, subSectionFields);
                                            const subsectionTags =
                                                subSectionMetaData?.[tags];
                                            return (
                                                <div
                                                    className={
                                                        styles.subSection
                                                    }
                                                >
                                                    <Accordion
                                                        key={sectionLabel}
                                                        sectionLabel={preparedPolicy.formatAsSectionLabel(
                                                            String(
                                                                subSectionLabel
                                                            )
                                                        )}
                                                        tags={subsectionTags}
                                                    >
                                                        <FindAllKeyValuesSection
                                                            preparedPolicy={
                                                                preparedPolicy
                                                            }
                                                            fields={
                                                                subSectionFields
                                                            }
                                                            searchValue={
                                                                searchValue
                                                            }
                                                            metaData={
                                                                subSectionMetaData
                                                            }
                                                        />
                                                    </Accordion>
                                                </div>
                                            );
                                        }
                                    )}
                                </Accordion>
                            );
                        })}
                    </div>
                </BlurOverlayLoader>
            </div>
        </SideSheet>
    );
};

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
                                                                className="text-primary"
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
