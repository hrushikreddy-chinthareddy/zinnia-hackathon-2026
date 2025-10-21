import { useQueryClient } from '@tanstack/react-query';
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
    Popover,
    Label,
} from '@zinnia/bloom/components';
import dayjs, { Dayjs } from 'dayjs';
import { ChangeEvent, FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import {
    buttonClickedTrackEvent,
    filterAppliedTrackEvent,
} from '@deps/helpers/analytics/segment-analytics';
import { usePolicyQuery } from '@deps/hooks/usePolicyQuery';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';

import styles from './find-all-key-values-sidesheet.module.css';
import { preparePolicy, prepareTransaction } from './transformations';
import {
    NestedData,
    label,
    tags,
    link,
    MetaData,
    DataTuple,
    Collapse,
    ExpandCollapse,
    Expand,
    toolTip,
    Section,
} from './types';
import DotContainer from '../dot-container/dot-container';
import { FieldSize, FieldType, FieldVariant } from '../fields/field';
import FieldDateSelect from '../fields/field-date-select/field-date-select';
import Highlighter from '../highlighter/highlighter';
import { BlurOverlayLoader } from '../overlay-loader/overlay-loader';

interface FindAllKeyValuesSidebarProps {
    planCode?: string;
    policyNumber?: string;
}

/**
 * A component that renders a list of key-value pairs based on the policyBasics
 * and searchValue.
 *
 * @param {ReturnType<typeof preparePolicy>} preparedPolicy - The policy details
 * @param {NestedData} policyBasics - The policy basics
 * @param {string} searchValue - The search value
 * @returns {JSX.Element} - A JSX element representing the key-value pairs
 */
const KeyValueBasics = ({
    preparedData,
    policyBasics,
    searchValue,
    treeState,
}: {
    preparedData: ReturnType<typeof preparePolicy | prepareTransaction>;
    policyBasics: NestedData;
    searchValue: string;
    treeState: ExpandCollapse;
}) => {
    console.log({ preparedData });
    return (
        <Accordion
            sectionLabel={
                <Highlighter
                    text={preparedData.formatAsSectionLabel('policyBasics')}
                    highlights={[searchValue]}
                />
            }
            type={AccordionType.NESTED}
            treeState={treeState}
        >
            <KeyValueFieldList
                fields={policyBasics}
                searchValue={searchValue}
                treeState={treeState}
            />
        </Accordion>
    );
};

/**
 * Renders a list of data sections.
 * Each section is rendered as a separate Accordion item.
 * The label of each section is highlighted if it matches the searchValue.
 * Each section contains a list of DataField components and/or a list of subsections.
 * The subsections are rendered recursively using the KeyValueSubSections component.
 * @param {ReturnType<typeof preparePolicy | prepareTransaction>} preparedData
 * @param {Section[]} section
 * @param {string} searchValue
 * @returns {JSX.Element[]}
 */
const KeyValueSections = ({
    preparedData,
    sections,
    searchValue,
    treeState,
}: {
    preparedData: ReturnType<typeof preparePolicy | prepareTransaction>;
    sections: Section[];
    searchValue: string;
    treeState: ExpandCollapse;
}) => {
    return sections?.map((section, i) => {
        const [sectionLabel, sectionData] = section;
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
                        text={preparedData.formatAsSectionLabel(sectionLabel)}
                        highlights={[searchValue]}
                    />
                }
                type={AccordionType.NESTED}
                treeState={treeState}
            >
                {fields && (
                    <KeyValueFieldList
                        fields={fields}
                        searchValue={searchValue}
                        treeState={treeState}
                    />
                )}

                {subSections && (
                    <KeyValueSubSections
                        subSections={subSections}
                        searchValue={searchValue}
                        treeState={treeState}
                    />
                )}
            </Accordion>
        );
    });
};

/**
 * Renders a list of subsections.
 * Each subsection is rendered as a separate Accordion item.
 * The label of each subsection is highlighted if it matches the searchValue.
 * Each subsection contains a list of DataField components.
 * @param {NestedData} subSections A list of subsections to render
 * @param {string} searchValue A string to highlight in the subsection labels
 * @returns {JSX.Element[]} The rendered list of subsections
 */
const KeyValueSubSections = ({
    subSections,
    searchValue,
    treeState,
}: {
    subSections: NestedData;
    searchValue: string;
    treeState: ExpandCollapse;
}) => {
    return subSections?.map((subSection, i) => {
        const [subSectionLabel, subSectionFields] = subSection as [
            string,
            NestedData
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
                    treeState={treeState}
                >
                    <KeyValueFieldList
                        fields={subSectionFields}
                        searchValue={searchValue}
                        treeState={treeState}
                    />
                </Accordion>
            </div>
        );
    });
};

/**
 * Renders a list of fields from the given NestedDataTuple.
 * If the field data is an array, renders it as a nested subSection.
 * Otherwise, renders it as a DataField.
 * @param {NestedData} fields The NestedDataTuple of fields to render
 * @param {string} searchValue The search value to highlight in the field labels
 * @returns {JSX.Element} The rendered list of fields
 */
const KeyValueFieldList = ({
    fields,
    searchValue,
    treeState,
}: {
    fields: NestedData;
    searchValue: string;
    treeState: ExpandCollapse;
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
                            subSections={field as NestedData[]}
                            searchValue={searchValue}
                            treeState={treeState}
                        />
                    );
                }

                // Otherwise, just render it as a DataField
                if (typeof key === 'string') {
                    return (
                        <DataField
                            key={`field_${i}`}
                            dataField={[key, String(data)]}
                            searchValue={searchValue}
                            link={(field as MetaData)?.[link]}
                            toolTip={(field as MetaData)?.[toolTip]}
                        />
                    );
                }
            })}
            <KeyValueNestedSubSections
                key={`subsection_`}
                subSections={fields as NestedData[]}
                searchValue={searchValue}
                treeState={treeState}
            />
        </div>
    );
};

/**
 * Renders a list of nested subsections.
 * Each subsection is rendered as a separate Accordion item.
 * The label of each subsection is highlighted if it matches the searchValue.
 * Each subsection contains a list of DataField components.
 *
 * @param subSections A list of nested subsections.
 * @param searchValue A string to highlight in the subsection labels.
 */
const KeyValueNestedSubSections = ({
    subSections,
    searchValue,
    treeState,
}: {
    subSections: NestedData[];
    searchValue: string;
    treeState: ExpandCollapse;
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
                    treeState={treeState}
                >
                    <div className={styles.itemsList}>
                        {(subSection as NestedData[])
                            .map((field, j) => {
                                const [label, data] = field as DataTuple;
                                const fieldLink = (field as MetaData)[link];
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
 * A component that renders a data field with a label and value.
 * The label is highlighted if it matches the search value.
 * The value is a link if a link is provided.
 *
 * @param dataField - The data field to render as [label, value]
 * @param link - The link for the value
 * @param searchValue - The search value to highlight in the label
 */
const DataField = ({
    dataField,
    link,
    toolTip,
    searchValue,
}: {
    dataField: [string, string];
    link?: string;
    toolTip?: string;
    searchValue: string;
}) => {
    const [fieldLabel, fieldData] = dataField;
    const [popoverContainer, setPopoverContainer] =
        useState<HTMLDivElement | null>(null);

    return (
        <DotContainer
            dotLeftSide={
                <div ref={setPopoverContainer} className={styles.fieldLabel}>
                    <Highlighter text={fieldLabel} highlights={[searchValue]} />
                    {toolTip && (
                        <Popover
                            container={popoverContainer}
                            title={fieldLabel}
                            trigger={
                                <Icon
                                    type={IconType.CIRCLE_INFO}
                                    color="var(--color-base-icon-icon-tooltip)"
                                    small
                                    className={styles.toolTipIcon}
                                />
                            }
                        >
                            <div className="typography-content-body-sm">
                                {toolTip}
                            </div>
                        </Popover>
                    )}
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
 * A Sidesheet component that displays all key-value pairs of a policy.
 *
 * When opened, it displays a date picker to select a date, and a search field to search
 * key-value pairs. The date picker is disabled for future dates, and the search field
 * filters down the key-value pairs based on the search value.
 *
 * @param {string} planCode - the plan code of the policy
 * @param {string} policyNumber - the policy number of the policy
 * @returns {JSX.Element} - the rendered component
 */
export const FindAllKeyValuesSidesheet: FC<FindAllKeyValuesSidebarProps> = ({
    planCode,
    policyNumber,
}) => {
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

    const debouncedSearchValue = useDebounce(searchValue, 200);

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
        <SideSheet
            trigger={
                <Button
                    mode="secondary"
                    size="small"
                    onClick={() =>
                        buttonClickedTrackEvent({
                            buttonText: 'Find key values',
                            authSessionId,
                            policyId: policyNumber,
                            planCode,
                        })
                    }
                >
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
        </SideSheet>
    );
};
