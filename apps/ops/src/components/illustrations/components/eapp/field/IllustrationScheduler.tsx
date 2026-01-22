import {
    FieldData,
    FieldTypes as FieldDataTypes,
    FieldSize,
    Button,
    Icon,
    IconType,
    Tooltip,
    Label,
    TooltipPlacement,
    FieldStatus,
    Select,
    AssistiveTextVariant,
} from '@zinnia/bloom/components';
import { QuestionnaireEngine } from '@zinnia/form-engine-sdk';
import { RenderingCustomField } from 'node_modules/@zinnia/form-engine-sdk/dist/esm/questionnaire-engine/renderingTransforms/RenderingQuestionnaire';
import { useCallback, useMemo } from 'react';
import { Infer, t } from 'typegate';
import { v4 as uuid } from 'uuid';

import AssistiveText from '@deps/components/assistive-text/assistive-text';
import { useQuestionnaireEngine } from '@deps/components/illustrations/providers/QuestionnaireEngineProvider';
import { ReactComponent as ErrorIcon } from '@deps/styles/elements/icons/icons_outlined/exclamation-circle-red.svg';

type Answer = Array<{
    id: string;
    firstColumn: number | string | undefined;
    fromYear: number | undefined;
    through: number | undefined;
}>;

const customPropertiesSchema = t.object(
    t.property(
        'firstColumn',
        t.discriminatedUnion(
            'type',
            t
                .object(
                    t.property('type', t.literal('money')),
                    t.property('label', t.record(t.string, t.string)),
                    t.optionalProperty(
                        'placeholder',
                        t.record(t.string, t.string)
                    ),
                    t.optionalProperty('default', t.number),
                    t.optionalProperty('tooltip', t.record(t.string, t.string))
                )
                .setTypeName('MoneyColumn'),
            t
                .object(
                    t.property('type', t.literal('dropdown')),
                    t.property('label', t.record(t.string, t.string)),
                    t.optionalProperty(
                        'placeholder',
                        t.record(t.string, t.string)
                    ),
                    t.property(
                        'options',
                        t.array(
                            t.object(
                                t.property('value', t.string),
                                t.property(
                                    'label',
                                    t.record(t.string, t.string)
                                )
                            )
                        )
                    ),
                    t.optionalProperty('default', t.string),
                    t.optionalProperty('tooltip', t.record(t.string, t.string))
                )
                .setTypeName('DropdownColumn')
        )
    ),
    t.property(
        'fromYear',
        t.object(
            t.property('min', t.number),
            t.property('label', t.record(t.string, t.string)),
            t.optionalProperty('placeholder', t.record(t.string, t.string))
        )
    ),
    t.property(
        'through',
        t.object(
            t.property('max', t.number),
            t.property('label', t.record(t.string, t.string)),
            t.optionalProperty('placeholder', t.record(t.string, t.string))
        )
    ),
    t.property(
        'buttons',
        t.object(
            t.property(
                'add',
                t.object(t.property('label', t.record(t.string, t.string)))
            )
        )
    )
);

type CustomProperties = Infer<typeof customPropertiesSchema>;

type Event =
    | { type: 'UserClickedOnAdd' }
    | { type: 'UserClickedOnRemove'; row: number }
    | {
          type: 'UserChangedFirstColumn';
          row: number;
          value: number | string | undefined;
      }
    | { type: 'UserChangedFromYear'; row: number; value: number | undefined }
    | { type: 'UserChangedThrough'; row: number; value: number | undefined };

const getEventHandlingFunction = (
    answer: Answer,
    field: RenderingCustomField,
    customProperties: CustomProperties,
    questionnaireEngine: QuestionnaireEngine
) => {
    return (event: Event) => {
        switch (event.type) {
            case 'UserClickedOnAdd': {
                if (answer.length > 0) {
                    answer.push({
                        id: uuid(),
                        firstColumn: customProperties.firstColumn.default,
                        fromYear: undefined,
                        through: customProperties.through.max,
                    });
                    answer[answer.length - 2].through = undefined;
                } else {
                    answer.push({
                        id: uuid(),
                        firstColumn: customProperties.firstColumn.default,
                        fromYear: customProperties.fromYear.min,
                        through: customProperties.through.max,
                    });
                }
                break;
            }
            case 'UserClickedOnRemove': {
                answer.splice(event.row, 1);

                if (answer.length >= 2 && event.row !== 0) {
                    const previousRow = answer[event.row - 1];
                    const nextRow = answer[event.row];

                    if (nextRow) {
                        if (previousRow.through) {
                            nextRow.fromYear = previousRow.through + 1;
                        } else if (nextRow.fromYear) {
                            previousRow.through = nextRow.fromYear - 1;
                        }
                    }
                }

                if (answer.length > 0) {
                    const firstRow = answer[0];
                    if (firstRow.fromYear !== customProperties.fromYear.min) {
                        firstRow.fromYear = customProperties.fromYear.min;
                    }

                    const lastRow = answer[answer.length - 1];
                    if (lastRow.through !== customProperties.through.max) {
                        lastRow.through = customProperties.through.max;
                    }
                }

                if (answer.length === 0) {
                    answer.push({
                        id: uuid(),
                        firstColumn: undefined,
                        fromYear: customProperties.fromYear.min,
                        through: customProperties.through.max,
                    });
                }

                break;
            }
            case 'UserChangedFirstColumn': {
                answer[event.row].firstColumn = event.value;
                break;
            }
            case 'UserChangedFromYear': {
                answer[event.row].fromYear = event.value;

                if (event.value === undefined) {
                    break;
                }

                if (event.row - 1 >= 0) {
                    answer[event.row - 1].through = event.value - 1;
                }
                break;
            }
            case 'UserChangedThrough': {
                answer[event.row].through = event.value;

                if (event.value === undefined) {
                    break;
                }

                if (event.row + 1 < answer.length) {
                    answer[event.row + 1].fromYear = event.value + 1;
                }
                break;
            }
        }

        questionnaireEngine.updateAnswer({
            tag: 'blueprintId',
            blueprintId: field.blueprintId,
            value: answer,
            blueprintIdScope:
                field.scope.repeatedInstanceIdentifierContext.byBlueprintId,
            nodeIdScope: field.scope.repeatedInstanceIdentifierContext.byNodeId,
        });
    };
};

function pluralize(n: number): string {
    if (n === 0) {
        return '0';
    } else if (n === 1) {
        return '1st';
    } else if (n === 2) {
        return '2nd';
    } else if (n === 3) {
        return '3rd';
    } else {
        return `${n}th`;
    }
}

function validateSequence(
    answer: Answer,
    customProperties: CustomProperties
): null | {
    message: string;
    cells: [number, 'firstColumn' | 'fromYear' | 'through'][];
} {
    for (let i = 0; i < answer.length; i++) {
        const row = answer[i];
        // if (row.firstColumn === undefined) {
        //     return {
        //         message: `${pluralize(i + 1)} row is missing a value in "${
        //             customProperties.firstColumn.label['en']
        //         }".`,
        //         cells: [[i, 'firstColumn']],
        //     };
        // }
        if (row.fromYear === undefined) {
            return {
                message: `${pluralize(i + 1)} row is missing a value in "${
                    customProperties.fromYear.label['en']
                }".`,
                cells: [[i, 'fromYear']],
            };
        }
        if (row.fromYear > customProperties.through.max) {
            return {
                message: `${pluralize(i + 1)} row "${
                    customProperties.fromYear.label['en']
                }" value is greater than the max of ${
                    customProperties.through.max
                }.`,
                cells: [[i, 'fromYear']],
            };
        }
        if (row.through === undefined) {
            return {
                message: `${pluralize(i + 1)} row is missing a value in "${
                    customProperties.through.label['en']
                }".`,
                cells: [[i, 'through']],
            };
        }

        if (row.fromYear > row.through) {
            return {
                message: `${pluralize(i + 1)} row "${
                    customProperties.fromYear.label['en']
                }" can't be greater than its "${
                    customProperties.through.label['en']
                }" value.`,
                cells: [
                    [i, 'fromYear'],
                    [i, 'through'],
                ],
            };
        }

        const isLastRow = i === answer.length - 1;

        if (isLastRow) {
            // Last row validations
            break;
        }

        // All other rows validations
        const nextRow = answer[i + 1];

        if (row.through >= customProperties.through.max) {
            return {
                message: `${pluralize(i + 1)} row "${
                    customProperties.through.label['en']
                }" value is greater or equal to the max of ${
                    customProperties.through.max
                }.`,
                cells: [[i, 'through']],
            };
        }

        if (row.through + 1 !== nextRow.fromYear) {
            return {
                message: `${pluralize(i + 1)} row "${
                    customProperties.fromYear.label['en']
                }" value should be ${nextRow.fromYear}.`,
                cells: [
                    [i, 'through'],
                    [i + 1, 'fromYear'],
                ],
            };
        }
    }

    return null;
}

interface Props {
    field: RenderingCustomField;
}

export function IllustrationScheduler(props: Props) {
    const { field } = props;
    const { questionnaireEngine } = useQuestionnaireEngine();
    const answerResolver = questionnaireEngine.getAnswerResolverInstance();
    const answer: Answer = useMemo(() => {
        const value = answerResolver.getAnswer(field.blueprintId, {});
        return value ? JSON.parse(JSON.stringify(value)) || [] : [];
    }, [answerResolver, field]);

    const result = customPropertiesSchema.parse(props.field.customProperties);

    const handleEvent = useCallback(
        (event: Event) => {
            if (result.success) {
                const handlingFunction = getEventHandlingFunction(
                    answer,
                    field,
                    result.value,
                    questionnaireEngine
                );

                handlingFunction(event);
            }
        },
        [answer, field, questionnaireEngine, result]
    );

    if (!result.success) {
        return (
            <AssistiveText
                className="col-span-full"
                iconOverride={<ErrorIcon height={16} width={16} />}
                text={`The custom properties are not properly defined in the blueprint for field with id "${field.blueprintId}". ${result.error}`}
                variant={AssistiveTextVariant.Error}
            />
        );
    }
    const customProperties = result.value;

    const error = validateSequence(answer, customProperties);

    return (
        <div style={{ marginBottom: 'var(--measure-dimension-margin-xs)' }}>
            <table
                style={{
                    borderCollapse: 'separate',
                    borderSpacing: 'var(--measure-dimension-gap-md)',
                }}
            >
                <thead>
                    <tr>
                        <td style={{ width: '50%' }}>
                            <div style={{ display: 'flex' }}>
                                <Label>
                                    {customProperties.firstColumn.label['en']}{' '}
                                </Label>

                                {customProperties.firstColumn.tooltip && (
                                    <Tooltip
                                        placement={TooltipPlacement.TopLeft}
                                        trigger={
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginLeft:
                                                        'var(--measure-dimension-gap-md)',
                                                }}
                                            >
                                                <Icon
                                                    type={IconType.CIRCLE_INFO}
                                                    color="var(--color-base-icon-action-text-link)"
                                                    width={16}
                                                    height={16}
                                                />
                                            </div>
                                        }
                                    >
                                        {
                                            customProperties.firstColumn
                                                .tooltip['en']
                                        }
                                    </Tooltip>
                                )}
                            </div>
                        </td>
                        <td>
                            <div style={{ display: 'flex' }}>
                                <Label>
                                    {customProperties.fromYear.label['en']}{' '}
                                </Label>
                            </div>
                        </td>
                        <td>
                            <div style={{ display: 'flex' }}>
                                <Label>
                                    {customProperties.through.label['en']}{' '}
                                </Label>
                            </div>
                        </td>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan={5}>
                            <hr />
                        </td>
                    </tr>

                    {answer.map((row, index) => {
                        return (
                            <tr key={row.id}>
                                <td style={{ width: '50%' }}>
                                    {customProperties.firstColumn.type ===
                                        'money' && (
                                        <FieldData
                                            name={'firstColumn'}
                                            value={
                                                row.firstColumn ||
                                                row.firstColumn === 0
                                                    ? row.firstColumn
                                                    : customProperties
                                                          .firstColumn.default // this can be undefined. The distribution scheduler works with undefined first columns to set the max value.
                                            }
                                            fieldStatus={
                                                error &&
                                                error.cells.some(
                                                    (c) =>
                                                        c[0] === index &&
                                                        c[1] === 'firstColumn'
                                                )
                                                    ? FieldStatus.ERROR
                                                    : undefined
                                            }
                                            onChange={(e) => {
                                                handleEvent({
                                                    type: 'UserChangedFirstColumn',
                                                    row: index,
                                                    value:
                                                        e.target.value === ''
                                                            ? undefined
                                                            : Number(
                                                                  e.target.value
                                                              ),
                                                });
                                            }}
                                            placeholder={
                                                customProperties.firstColumn
                                                    .placeholder?.['en']
                                            }
                                            fieldType={FieldDataTypes.Value}
                                            fieldSize={FieldSize.Small}
                                        />
                                    )}
                                    {customProperties.firstColumn.type ===
                                        'dropdown' && (
                                        <Select
                                            name={'firstColumn'}
                                            value={
                                                row.firstColumn !== undefined
                                                    ? String(row.firstColumn)
                                                    : undefined
                                            }
                                            fieldStatus={
                                                error &&
                                                error.cells.some(
                                                    (c) =>
                                                        c[0] === index &&
                                                        c[1] === 'firstColumn'
                                                )
                                                    ? FieldStatus.ERROR
                                                    : undefined
                                            }
                                            onValueChange={(value) => {
                                                handleEvent({
                                                    type: 'UserChangedFirstColumn',
                                                    row: index,
                                                    value: value,
                                                });
                                            }}
                                            options={customProperties.firstColumn.options.map(
                                                (e) => ({
                                                    value: e.value,
                                                    textValue: e.label['en'],
                                                })
                                            )}
                                            placeholder={
                                                customProperties.firstColumn
                                                    .placeholder?.['en']
                                            }
                                            fieldSize={FieldSize.Small}
                                        />
                                    )}
                                </td>

                                <td>
                                    <FieldData
                                        name={'fromYear'}
                                        value={row.fromYear || ''}
                                        fieldStatus={
                                            error &&
                                            error.cells.some(
                                                (c) =>
                                                    c[0] === index &&
                                                    c[1] === 'fromYear'
                                            )
                                                ? FieldStatus.ERROR
                                                : undefined
                                        }
                                        readOnly={index === 0}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            handleEvent({
                                                type: 'UserChangedFromYear',
                                                row: index,
                                                value:
                                                    value === ''
                                                        ? undefined
                                                        : parseInt(value),
                                            });
                                        }}
                                        placeholder={
                                            customProperties.fromYear
                                                .placeholder?.['en']
                                        }
                                        fieldType={FieldDataTypes.Number}
                                        fieldSize={FieldSize.Small}
                                    />
                                </td>

                                <td>
                                    <FieldData
                                        name={'through'}
                                        value={row.through || ''}
                                        readOnly={index === answer.length - 1}
                                        fieldStatus={
                                            error &&
                                            error.cells.some(
                                                (c) =>
                                                    c[0] === index &&
                                                    c[1] === 'through'
                                            )
                                                ? FieldStatus.ERROR
                                                : undefined
                                        }
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            handleEvent({
                                                type: 'UserChangedThrough',
                                                row: index,
                                                value:
                                                    value === ''
                                                        ? undefined
                                                        : parseInt(value),
                                            });
                                        }}
                                        placeholder={
                                            customProperties.through
                                                .placeholder?.['en']
                                        }
                                        fieldType={FieldDataTypes.Number}
                                        fieldSize={FieldSize.Small}
                                    />
                                </td>
                                <td>
                                    {answer.length > 1 && (
                                        <button
                                            onClick={() => {
                                                handleEvent({
                                                    type: 'UserClickedOnRemove',
                                                    row: index,
                                                });
                                            }}
                                        >
                                            <Icon
                                                type={IconType.TRASH}
                                                height={16}
                                                width={16}
                                                color="var(--color-links-color-global-link)"
                                                alt={'delete'}
                                            />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    <tr>
                        <td colSpan={5}>
                            <hr />
                        </td>
                    </tr>
                </tbody>
            </table>
            <Button
                size="small"
                mode="link"
                onClick={() => {
                    handleEvent({ type: 'UserClickedOnAdd' });
                }}
            >
                <Icon type={IconType.ADD} width={16} height={16} />{' '}
                {customProperties.buttons.add.label['en'] || 'Add new row'}
            </Button>

            {error && (
                <div style={{ marginTop: 'var(--measure-dimension-gap-md)' }}>
                    <AssistiveText
                        className="col-span-full"
                        iconOverride={<ErrorIcon height={16} width={16} />}
                        text={error.message}
                        variant={AssistiveTextVariant.Error}
                    />
                </div>
            )}
        </div>
    );
}
