import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Policy } from '@xd/api-types/dist/generated-types/sor';
import { Accordion } from '@xd/components/Accordion/Accordion';
import { AccordionType } from '@xd/xd-components/src/components/Accordion/types';
import useDebounce from '@xd/xd-components/src/hooks/useDebounce';
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
    NestedDataTuple,
    label,
    tags,
    link,
    MetaData,
    DataTuple,
    PolicySection,
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
    policyBasics: NestedDataTuple;
    searchValue: string;
}) => (
    <Accordion
        sectionLabel={
            <Highlighter
                text={preparedPolicy.formatAsSectionLabel('policyBasics')}
                highlights={[searchValue]}
            />
        }
        type={AccordionType.NESTED}
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
    return policySections?.map((policySection, i) => {
        const [sectionLabel, sectionData] = policySection;
        const { fields, subSections } = sectionData;

        if (
            typeof sectionLabel !== 'string' ||
            (fields == null && subSections == null)
        ) {
            return null;
        }
        return (
            <Accordion
                key={`section_${i}`}
                sectionLabel={
                    <Highlighter
                        text={preparedPolicy.formatAsSectionLabel(sectionLabel)}
                        highlights={[searchValue]}
                    />
                }
                type={AccordionType.NESTED}
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
}: {
    preparedPolicy: ReturnType<typeof preparePolicy>;
    subSections: NestedDataTuple;
    searchValue: string;
}) => {
    return subSections?.map((subSection, i) => {
        const [subSectionLabel, subSectionFields] = subSection as [
            string,
            NestedDataTuple
        ];
        const subsectionTags = (subSection as MetaData)[tags];
        return (
            <div key={`subsection_${i}`} className={styles.subSection}>
                <Accordion
                    sectionLabel={
                        <Highlighter
                            text={String(subSectionLabel)}
                            highlights={[searchValue]}
                        />
                    }
                    tags={subsectionTags}
                    type={AccordionType.NESTED}
                >
                    <KeyValueFieldList
                        preparedPolicy={preparedPolicy}
                        fields={subSectionFields}
                        searchValue={searchValue}
                    />
                </Accordion>
            </div>
        );
    });
};

/**
 * Given a list of field tuples and a search value, renders a list of field
 * values. If the field value is an array, renders it as a subSection-in-subSection.
 * Otherwise, renders it as a DataField.
 *
 * @param preparedPolicy The prepared policy to use for formatting
 * @param fields The list of field tuples to render
 * @param searchValue The search value to highlight in the rendered fields
 * @param metaData Optional metadata for the field list. If provided, will be
 * passed to the DataField component.
 * @returns A JSX element representing the rendered field list
 */
const KeyValueFieldList = ({
    preparedPolicy,
    fields,
    searchValue,
}: {
    preparedPolicy: ReturnType<typeof preparePolicy>;
    fields: NestedDataTuple;
    searchValue: string;
}) => {
    return (
        <div className={styles.itemsList}>
            {fields?.map((field, i) => {
                // If the field data is an array, render it as a
                // subSection-in-subSection
                const [key, data] = field as unknown[];

                // The data returned is either a Tuple or an Array of Tuples;
                // If the first element (key) is an array, it's a nested subSection
                if (key instanceof Array) {
                    return (
                        <KeyValueNestedSubSections
                            key={`subsection_${i}`}
                            subSections={field as NestedDataTuple[]} // FIXME
                            searchValue={searchValue}
                        />
                    );
                }

                // Otherwise, just render it as a DataField
                if (typeof key === 'string') {
                    return (
                        <DataField
                            key={`field_${i}`}
                            dataField={[key, String(data)]} // FIXME
                            searchValue={searchValue}
                            link={(field as MetaData)?.[link]}
                        />
                    );
                }
            })}
        </div>
    );
};

/**
 * Given a list of nested subsections, renders each subsection as a nested Accordion
 * with a single field list.
 *
 * Each subsection is rendered as an Accordion with the subsection label as the
 * section label, and the subsection tags as the tags.
 *
 * @param {ReturnType<typeof preparePolicy>} preparedPolicy
 * @param {DataRecord[]} subSections
 * @param {string} searchValue
 * @returns {JSX.Element[]}
 */
const KeyValueNestedSubSections = ({
    subSections,
    searchValue,
}: {
    subSections: NestedDataTuple[];
    searchValue: string;
}) => {
    return subSections.map((subSection, i) => {
        const subSectionLabel = (subSection as MetaData)[label];
        if (subSectionLabel == null) return null;

        const subSectionTags = (subSection as MetaData)[tags] as string[];

        return (
            <div key={`nested_subsection_${i}`} className={styles.subSection}>
                <Accordion
                    key={String(subSectionLabel)}
                    sectionLabel={
                        <Highlighter
                            text={String(subSectionLabel)}
                            highlights={[searchValue]}
                        />
                    }
                    tags={subSectionTags}
                    type={AccordionType.NESTED}
                >
                    <div className={styles.itemsList}>
                        {(subSection as NestedDataTuple[])
                            .map((field, j) => {
                                const [label, data] = field as DataTuple;
                                const fieldLink = (field as MetaData)[link];
                                // FIXME: disallow Symbol in field label
                                return typeof label === 'string' ? (
                                    <DataField
                                        key={`field_${j}`}
                                        dataField={[label, String(data)]}
                                        searchValue={searchValue}
                                        link={fieldLink}
                                    />
                                ) : null;
                            })
                            .filter((field) => field !== null)}
                    </div>
                </Accordion>
            </div>
        );
    });
};

/**
 * Given a policy field tuple, renders a single field as a DotContainer with:
 *
 * - The field label on the left side, highlighted if it matches the search value.
 * - The field data on the right side, or a link to the field data if the field
 *   is a link field and the link is provided.
 *
 * @param {ReturnType<typeof preparePolicy>} preparedPolicy
 * @param {DataTuple} dataField
 * @param {string} link
 * @param {string} linkField
 * @param {string} searchValue
 * @returns {JSX.Element}
 */
const DataField = ({
    dataField,
    link,
    searchValue,
}: {
    dataField: [string, string];
    link?: string;
    searchValue: string;
}) => {
    const [fieldLabel, fieldData] = dataField;
    return (
        <DotContainer
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
            dotRightSide={
                link ? (
                    <Link href={link} text={fieldData} />
                ) : (
                    <Highlighter text={fieldData} highlights={[searchValue]} />
                )
            }
            dotRightSideClassName="typography-content-body-sm"
        />
    );
};

/**
 * FindAllKeyValuesSidesheet is a Sidesheet component that allows users to search through the key values of a given policy.
 *
 * The component takes in the `planCode` and `policyNumber` as props, and fetches the policy data from the API.
 * It also takes care of debouncing the search value and filtering the key values accordingly.
 *
 * The component renders a date picker that allows the user to select a date, and a search bar that allows the user to search for key values.
 * The results are then displayed in a table below, with the key values grouped by section.
 *
 * The component also handles loading and error states, and will display a loading overlay if the data is still being fetched,
 * or an error message if the data is not available.
 *
 * @param planCode - The code of the plan to fetch the policy for
 * @param policyNumber - The number of the policy to fetch
 * @returns - The rendered Sidesheet component
 */
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

    const debouncedSearchValue = useDebounce(searchValue, 200);

    /*
    // When user searches, filter down the key values
    const filteredKeys = useMemo(() => {
        return filterOnSearchHandler(keyValues, {
            searchValue: debouncedSearchValue,
        });
    }, [keyValues, debouncedSearchValue]);

    */

    // This retains all the persistent extracted data on the policy
    const preparedPolicy = useMemo(
        () => (policy ? preparePolicy(policy, t, debouncedSearchValue) : null),
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

    if (!preparedPolicy) return null; //FIXME: add loading state

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
                        {policyBasics && (
                            <KeyValueBasics
                                preparedPolicy={preparedPolicy}
                                policyBasics={policyBasics as NestedDataTuple[]}
                                searchValue={searchValue}
                            />
                        )}

                        {policySections && (
                            <KeyValueSections
                                preparedPolicy={preparedPolicy}
                                policySections={policySections}
                                searchValue={searchValue}
                            />
                        )}
                    </div>
                </BlurOverlayLoader>
            </div>
        </SideSheet>
    );
};
