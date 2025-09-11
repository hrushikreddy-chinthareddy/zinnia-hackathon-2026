import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Policy } from '@xd/api-types/dist/generated-types/sor';
import { Accordion } from '@xd/components/Accordion/Accordion';
import {
    SideSheet,
    Icon,
    IconType,
    Button,
    FieldData,
    FieldTypes,
    FieldSize as BloomFieldSize,
    Link,
} from '@zinnia/bloom/components';
import dayjs, { Dayjs } from 'dayjs';
import { ChangeEvent, FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    getPolicyQueryKey,
    getPolicyQuery,
} from '@deps/queries/tanstack/policyQueries/policyQueries';
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
    PolicySection,
    SubSection,
    tags,
} from './types';
import DotContainer from '../dot-container/dot-container';
import { FieldSize, FieldType, FieldVariant } from '../fields/field';
import FieldDateSelect, {
    DATE_PICKER_FORMAT,
} from '../fields/field-date-select/field-date-select';
import Highlighter from '../highlighter/highlighter';
import { BlurOverlayLoader } from '../overlay-loader/overlay-loader';

interface FindAllKeyValuesSidebarProps {
    planCode?: string;
    policyNumber?: string;
}

/**
 * Renders policy basics (fields directly on the policy object)
 *
 * @param {ReturnType<typeof preparePolicy>} preparedPolicy
 * @param {DataTuple[]} policyBasics
 * @param {string} searchValue
 * @returns {JSX.Element}
 */
const KeyValueBasics = ({
    preparedPolicy,
    policyBasics,
    searchValue,
}: {
    preparedPolicy: ReturnType<typeof preparePolicy>;
    policyBasics: DataTuple[];
    searchValue: string;
}) => (
    /* FIXME: i18n */
    <Accordion
        key="policyBasics"
        sectionLabel={preparedPolicy.formatAsSectionLabel('Policy basics')}
    >
        <KeyValueFieldList
            preparedPolicy={preparedPolicy}
            fields={policyBasics}
            searchValue={searchValue}
        />
    </Accordion>
);

/**
 * Renders policy sections (fields nested under a section label).
 *
 * @param {ReturnType<typeof preparePolicy>} preparedPolicy
 * @param {PolicySection[]} policySections
 * @param {string} searchValue
 * @returns {JSX.Element[]}
 */
const KeyValueSections = ({
    preparedPolicy,
    policySections,
    searchValue,
}: {
    preparedPolicy: ReturnType<typeof preparePolicy>;
    policySections: PolicySection[];
    searchValue: string;
}) => {
    return policySections.map(([sectionLabel, sectionData]) => {
        const { fields, subSections } = preparedPolicy.toFieldsAndSubsections([
            sectionLabel,
            sectionData,
        ]);
        if (
            typeof sectionLabel !== 'string' ||
            (fields == null && subSections == null)
        ) {
            return null;
        }
        return (
            <Accordion
                key={sectionLabel}
                sectionLabel={preparedPolicy.formatAsSectionLabel(sectionLabel)}
            >
                {fields && (
                    <KeyValueFieldList
                        preparedPolicy={preparedPolicy}
                        fields={fields}
                        searchValue={searchValue}
                    />
                )}

                {subSections && (
                    <KeyValueSubSections
                        preparedPolicy={preparedPolicy}
                        subSections={subSections}
                        searchValue={searchValue}
                        sectionLabel={sectionLabel}
                    />
                )}
            </Accordion>
        );
    });
};
/**
 * Renders subsections (fields nested under a section).
 *
 * @param {ReturnType<typeof preparePolicy>} preparedPolicy
 * @param {SubSection[]} subSections
 * @param {string} searchValue
 * @param {string} sectionLabel
 * @returns {JSX.Element[]}
 */
const KeyValueSubSections = ({
    preparedPolicy,
    subSections,
    searchValue,
    sectionLabel,
}: {
    preparedPolicy: ReturnType<typeof preparePolicy>;
    subSections: SubSection[];
    searchValue: string;
    sectionLabel: string;
}) => {
    return subSections?.map(
        ([subSectionLabel, subSectionFields, subSectionMetaData]) => {
            //console.log('in subsection...', subSectionLabel, subSectionFields);
            const subsectionTags = subSectionMetaData?.[tags];
            return (
                <div className={styles.subSection}>
                    <Accordion
                        key={sectionLabel}
                        sectionLabel={String(subSectionLabel)}
                        tags={subsectionTags}
                    >
                        <KeyValueFieldList
                            preparedPolicy={preparedPolicy}
                            fields={subSectionFields}
                            searchValue={searchValue}
                            metaData={subSectionMetaData}
                        />
                    </Accordion>
                </div>
            );
        }
    );
};

const KeyValueFieldList = ({
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
                        <KeyValueNestedSubSection
                            preparedPolicy={preparedPolicy}
                            subSections={unformattedData as DataRecord[]}
                            searchValue={searchValue}
                        />
                    );
                }

                // Otherwise, just render it as a DataField
                return (
                    <DataField
                        preparedPolicy={preparedPolicy}
                        dataField={field}
                        searchValue={searchValue}
                        link={metaData?.[link]}
                        linkField={metaData?.[linkedField]}
                    />
                );
            })}
        </div>
    );
};

const KeyValueNestedSubSection = ({
    preparedPolicy,
    subSections,
    searchValue,
}: {
    preparedPolicy: ReturnType<typeof preparePolicy>;
    subSections: DataRecord[];
    searchValue: string;
}) => {
    //console.log('|-------->fields', fields);
    return subSections.map((subSection) => {
        const subSectonLabel = subSection[label];
        if (subSectonLabel == null) return null;
        const subSectionTags = subSection[tags] as string[];
        const subSectionLink = subSection[link] as string;
        const subSectionLinkField = subSection[linkedField] as string;
        //console.log('|-------->fieldLink', fieldLink, fieldLinkField);
        return (
            <div className={styles.subSection}>
                <Accordion
                    key={String(subSectonLabel)}
                    sectionLabel={String(subSectonLabel)}
                    tags={subSectionTags}
                >
                    <div className={styles.itemsList}>
                        {Object.entries(subSection).map((dataField) => {
                            return (
                                <DataField
                                    preparedPolicy={preparedPolicy}
                                    dataField={dataField}
                                    searchValue={searchValue}
                                    link={subSectionLink}
                                    linkField={subSectionLinkField}
                                />
                            );
                        })}
                    </div>
                </Accordion>
            </div>
        );
    });
};

const DataField = ({
    preparedPolicy,
    dataField,
    link,
    linkField,
    searchValue,
}: {
    preparedPolicy: ReturnType<typeof preparePolicy>;
    dataField: DataTuple;
    link?: string;
    linkField?: string;
    searchValue: string;
}) => {
    const formattedField = preparedPolicy.formatDataField(dataField);
    if (!formattedField) return null;
    const [fieldLabel, fieldData] = formattedField;
    const linkedField =
        link && linkField === dataField[0] ? (
            <Link href={link} text={fieldData} />
        ) : undefined;

    return (
        <DotContainer
            key={fieldLabel}
            dotLeftSide={
                <div>
                    <Highlighter text={fieldLabel} highlights={[searchValue]} />
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
            dotRightSide={linkedField ?? fieldData}
            dotRightSideClassName="typography-content-body-sm"
        />
    );
};

export const FindAllKeyValuesSidesheet: FC<FindAllKeyValuesSidebarProps> = ({
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
                        <KeyValueBasics
                            preparedPolicy={preparedPolicy}
                            policyBasics={policyBasics}
                            searchValue={searchValue}
                        />

                        <KeyValueSections
                            preparedPolicy={preparedPolicy}
                            policySections={policySections}
                            searchValue={searchValue}
                        />
                    </div>
                </BlurOverlayLoader>
            </div>
        </SideSheet>
    );
};
