import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';

import 'react-pdf/dist/Page/TextLayer.css';
import { Loader } from '@deps/components/page-loader';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { DocumentDisplayCode, PolicyDocument, PolicyDocuments } from '@deps/models/case/document';
import { StatementStartYear, StatementTypes } from '@deps/models/case/send-statement';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { Policy } from '@deps/models/policy/sor-policy';
import { getCorrespondenceDocs } from '@deps/queries/api/documents';

import SendDocumentNavigationButtons from './action-components/navigation-buttons';
import StatementListing from './components/statement-listing';
import AssistiveText, { AssistiveTextVariant } from '../assistive-text/assistive-text';
import CheckboxText from '../checkbox/checkbox-text/checkbox-text';
import { DatePickerTypes, getQuarter, Quarter, quarters } from '../date-picker/date-picker';
import { FieldSize, FieldType } from '../fields/field';
import FieldDateSelect from '../fields/field-date-select/field-date-select';
import WorkflowCard from '../workflows/workflow-card/workflow-card';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

const toggleStatement = (val: StatementTypes, SetSelectedStatements: React.Dispatch<React.SetStateAction<StatementTypes[]>>) => {
    return (shouldHaveStatement: boolean) => {
        SetSelectedStatements(statements => {
            const hasActiveStatement = statements.includes(val);

            if (!hasActiveStatement && shouldHaveStatement) {
                return [...statements, val];
            }

            if (hasActiveStatement && !shouldHaveStatement) {
                return statements.filter(statement => statement !== val);
            }

            return statements;
        });
    };
};

const getDayjsDate = (date: string): Dayjs => {
    const [_year, _quarter] = date.split('-');
    const month = quarters.find(quarter => quarter.value === (_quarter as Quarter))?.month ?? 1;

    return dayjs().year(Number(_year)).month(month).date(1);
};

const getSelectedYearQuarters = (startDate: string, endDate: string, selectedStatements: StatementTypes[]) => {
    const [startYear, startQuarter] = startDate.split('-');
    const [endYear, endQuarter] = endDate.split('-');
    const startQuarterIndex = quarters.findIndex(item => item.value === startQuarter);
    const endQuarterIndex = quarters.findIndex(item => item.value === endQuarter);

    if (startYear === endYear) {
        return [
            {
                periodYear: Number(startYear),
                PeriodQuarters:
                    quarters.filter((_, index) => index >= startQuarterIndex && index <= endQuarterIndex).map(item => item.value) || [],
            },
        ];
    } else {
        const years = Number(endYear) - Number(startYear);

        const periodQuarters = Array.from({ length: years + 1 }, (_, i) => {
            const periodYear = Number(startYear) + i;
            let periodQuarters: Quarter[];
            if (selectedStatements.includes(StatementTypes.AnniversaryStatement)) {
                return { periodYear, periodQuarters: [] };
            }
            if (i === 0) {
                periodQuarters = quarters.slice(startQuarterIndex).map(item => item.value);
            } else if (i === years) {
                periodQuarters = quarters.slice(0, endQuarterIndex + 1).map(item => item.value);
            } else {
                periodQuarters = quarters.map(item => item.value);
            }
            return { periodYear, periodQuarters };
        });
        return periodQuarters;
    }
};

export type StatementSelectionProps = {
    policy: Policy;
    applicableStatement: StatementTypes[];
    statements: PolicyDocument[];
    setStatements: React.Dispatch<React.SetStateAction<PolicyDocument[]>>;
};

const getDatePickerType = (selectedStatements: StatementTypes[]) => {
    if (selectedStatements.includes(StatementTypes.QuarterlyStatement)) {
        return DatePickerTypes.Quarterly;
    } else {
        return DatePickerTypes.Annually;
    }
};

const ownerCopyStatements = (statements: PolicyDocument[]) => {
    if (!statements) {
        return [];
    }

    return statements
        ?.filter(statement => statement.displayCode === DocumentDisplayCode.Owner)
        ?.sort((a, b) => {
            return dayjs(b.documentDate).isBefore(a.documentDate) ? 1 : -1;
        });
};

function StatementSelection({ policy, applicableStatement, statements, setStatements }: StatementSelectionProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'contactCenter' });
    const { goToNext } = useWorkflow();

    const statementStartYear = policy.policyDates?.issueDate || StatementStartYear;
    const [selectedStatementType, setSelectedStatementType] = useState<StatementTypes[]>(applicableStatement);
    const currentYear = dayjs().year().toString();
    const currentQuarter = `${currentYear}-Q${getQuarter(dayjs())}`;
    const defaultDate =
        applicableStatement.length === 1 && applicableStatement[0] === StatementTypes.AnniversaryStatement ? currentYear : currentQuarter;
    const [startDate, setStartDate] = useState(defaultDate);
    const [endDate, setEndDate] = useState(defaultDate);
    const [error, setError] = useState<FormValidationErrors>({});
    const [loader, setLoader] = useState(false);
    const [datePickerType, setdatePickerType] = useState(getDatePickerType(selectedStatementType));

    useEffect(() => {
        setdatePickerType(getDatePickerType(selectedStatementType));

        // clear the dates on statement type change
        if (selectedStatementType[0] !== applicableStatement[0]) {
            setStartDate('');
            setEndDate('');
        }
    }, [applicableStatement, selectedStatementType]);

    function isChecked(val: string, statements: string[]): boolean {
        return !!statements.includes(val);
    }

    const statementTypes = [
        {
            label: t('sendStatement.statementTypes.annualAnniversaryStatement'),
            value: StatementTypes.AnniversaryStatement,
        },
        {
            label: t('sendStatement.statementTypes.quarterlyStatement'),
            value: StatementTypes.QuarterlyStatement,
        },
    ];

    const handleContinue = async () => {
        if (!statements.length) {
            return setError({ submit: t('errors.statements') as string });
        }
        goToNext();
    };

    const handleCancel = () => {
        setStartDate('');
        setEndDate('');
        setStatements([]);
    };

    useEffect(() => {
        const getStatements = async (startDate: string, endDate: string) => {
            if (startDate && endDate) {
                try {
                    setLoader(true);
                    setError({});
                    setStatements(() => []);
                    if (selectedStatementType.length === 0) {
                        setError({ statementType: t('errors.statementType') as string });
                        return;
                    } else {
                        const selectedYearQuarters = getSelectedYearQuarters(startDate, endDate, selectedStatementType);
                        //  adding ANNSTM & ANN to the document type filter if anniversary statement is selected
                        const documentTypes = applicableStatement.find(statement => statement === StatementTypes.AnniversaryStatement)
                            ? [...applicableStatement, StatementTypes.AnnualStatement]
                            : applicableStatement;

                        const optionalParams = {
                            documentType: documentTypes.join(','),
                            periods: encodeURIComponent(JSON.stringify(selectedYearQuarters)),
                        };

                        browserLogInfo('contactCenterGetStatements', {
                            ...parseErrorInformation(error),
                            payload: {
                                contractNumber: policy?.policyNumber,
                                planCode: policy?.product?.planCode || '',
                                startDate,
                                endDate,
                                ...optionalParams,
                            },
                            function: 'documents.getCorrespondenceDocs',
                        });

                        const response = await getCorrespondenceDocs(policy?.policyNumber || '', policy?.carrierId || '', optionalParams);

                        if ('err' in response.data) {
                            setError({ submit: response.data.err });
                            return;
                        }
                        const statements: PolicyDocuments = response.data;
                        setStatements(ownerCopyStatements(statements.items));
                    }
                } catch (error) {
                    browserLogError('contactCenterGetStatements', {
                        ...parseErrorInformation(error),
                        payload: { contractNumber: policy?.policyNumber, startDate, endDate, planCode: policy?.product?.planCode || '' },
                        function: 'documents.getCorrespondenceDocs',
                    });
                } finally {
                    setLoader(false);
                }
            }
        };

        getStatements(startDate, endDate);
    }, [startDate, endDate, selectedStatementType]);

    function handleIsDateAllowed(date: Dayjs, startDate: string): boolean {
        const start = getDayjsDate(startDate);

        const dateIsAllowed = dayjs(date).isAfter(start);

        return Boolean(dateIsAllowed);
    }

    return (
        <WorkflowCard
            title={t(`sendStatement.tabs.statementSelection`)}
            footerContent={<SendDocumentNavigationButtons handleContinue={handleContinue} handleCancel={handleCancel} />}
        >
            <div className="flex flex-col gap-4">
                {statementTypes.map(({ label, value }) => {
                    return (
                        <div key={`select-${value}`}>
                            <CheckboxText
                                checked={isChecked(value, selectedStatementType)}
                                label={label}
                                onChange={toggleStatement(value, setSelectedStatementType)}
                                isDisabled={applicableStatement?.includes(value) ? false : true}
                            />
                        </div>
                    );
                })}
            </div>
            <div className="my-8 grid grid-cols-3 gap-4">
                <FieldDateSelect
                    label={t('sendStatement.startDate') as string}
                    id="start-date"
                    isFutureDateDisabled={true}
                    onChange={e => {
                        setStartDate(e.target.value);
                    }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={startDate}
                    disableFormat={true}
                    showMonths={false}
                    datePickerType={datePickerType}
                    isDateAllowed={date => handleIsDateAllowed(date, statementStartYear)}
                    readOnly={true}
                />

                <FieldDateSelect
                    label={t('sendStatement.endDate') as string}
                    id="end-date"
                    isFutureDateDisabled={true}
                    onChange={e => {
                        setEndDate(e.target.value);
                    }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={endDate}
                    disableFormat={true}
                    showMonths={false}
                    datePickerType={datePickerType}
                    isDateAllowed={date => handleIsDateAllowed(date, startDate)}
                    readOnly={true}
                />
            </div>

            {loader ? (
                <Loader />
            ) : (
                startDate &&
                endDate &&
                !Object.keys(error).length && <StatementListing statements={statements} carrierId={policy?.carrierId || ''} />
            )}
            {error && (
                <div className="flex flex-col mt-2">
                    {error.statementType && <AssistiveText text={error.statementType} variant={AssistiveTextVariant.Error} />}

                    {error.submit && <AssistiveText text={error?.submit} variant={AssistiveTextVariant.Error} />}
                </div>
            )}
        </WorkflowCard>
    );
}

export default StatementSelection;
