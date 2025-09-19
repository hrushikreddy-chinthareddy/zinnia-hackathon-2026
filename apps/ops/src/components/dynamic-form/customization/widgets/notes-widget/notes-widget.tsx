import { useUser } from '@auth0/nextjs-auth0/client';
import { FormContextType, getUiOptions, WidgetProps } from '@rjsf/utils';
import { Button } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import Content, { ContentVariant } from '@deps/components/content/content';
import CustomLoader from '@deps/components/loader/customLoader';
import { TranslationFiles } from '@deps/config/translations';
import { updateTask } from '@deps/containers/task-container/task.helpers';
import {
    convertKebabedDateString,
    reverseNameOrder,
} from '@deps/helpers/string.helpers';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import {
    DEFAULT_EXTENDED_DATE_FORMAT,
    DEFAULT_TIMESTAMP_FORMAT,
} from '@deps/types/constants';
import { browserLogError, browserLogWarn } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

type InlineDisplayProps = {
    title: string;
    value: string | { note: string; user: string }[];
    required?: boolean;
};

const InlineDisplay = ({ title, value, required }: InlineDisplayProps) => (
    <div className="grid grid-cols-2 text-md max-w-screen-sm">
        <div className="font-medium text-gray-500">{title}</div>
        {required && (
            <span className="text-[var(--color-secondary-color-primary)]">
                {' '}
                *{' '}
            </span>
        )}
        <div className="flex flex-col">
            {Array.isArray(value) ? (
                value.map((item, idx) => <span key={idx}>{item.note}</span>)
            ) : (
                <span>{value}</span>
            )}
        </div>
    </div>
);

const getPathArrayFromId = (id: string) => {
    return id
        .replace(/^root_/, '')
        .split('_')
        .map((part: any) => (isNaN(part) ? part : Number(part)));
};

const setNestedValue = (obj: any, pathArray: any, value: any) => {
    let current = obj;
    for (let i = 0; i < pathArray.length - 1; i++) {
        const key = pathArray[i];

        if (!(key in current)) {
            current[key] = typeof pathArray[i + 1] === 'number' ? [] : {};
        }
        current = current[key];
    }
    current[pathArray[pathArray.length - 1]] = value;
};

const buildNotesPayload = (
    initialTask: ManagementTask,
    id: string,
    updatedValue: any
) => {
    const pathArray = getPathArrayFromId(id);
    const updatedData = structuredClone(initialTask);
    setNestedValue(updatedData.data, pathArray, updatedValue);

    return {
        ...initialTask,
        data: updatedData.data,
    };
};

export default function NotesWidget(props: WidgetProps) {
    const {
        uiSchema,
        schema: { title },
        label,
        value,
        id,
        formContext,
        readonly,
        disabled,
        required,
    } = props;
    const { setSubmitEnabled } = formContext;
    const [notes, setNotes] = useState(value || []);
    const [currentNote, setCurrentNote] = useState('');
    const { user } = useUser();
    const [loader, setLoader] = useState(false);
    const [error, setError] = useState(false);
    const { inline, inlineWithWidget, noteEditorTitle } =
        getUiOptions(uiSchema);
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'taskManagementQueue',
    });

    useEffect(() => {
        if (required) {
            const enableNote = Array.isArray(notes) && notes.length > 0;
            setSubmitEnabled(enableNote);
        } else {
            setSubmitEnabled(true);
        }
    }, [notes, value, required, setSubmitEnabled]);

    const { customData, setCustomData } = formContext as FormContextType;
    const { task, correlationId } = customData;

    const addNote = () => {
        setError(false);
        const timestamp = dayjs().utc().format(DEFAULT_TIMESTAMP_FORMAT);
        const newNote = {
            note: currentNote.trim(),
            createdAt: timestamp,
            user: reverseNameOrder(user?.name ?? ''),
        };
        const updatedNotes = [newNote, ...notes];
        const notesPayload = buildNotesPayload(task, id, updatedNotes);

        setLoader(true);
        updateTask(notesPayload, correlationId, TaskStatus.InProgress)
            .then((success) => {
                if (success) {
                    setNotes(updatedNotes);
                    setCustomData(notesPayload.data);
                    setCurrentNote('');
                } else {
                    browserLogWarn('updateTask::Error updating task', {
                        taskId: task.id,
                    });
                    setError(true);
                }
            })
            .catch((error) => {
                browserLogError('updateTask::Error updating task', {
                    ...parseErrorInformation(error),
                    taskId: task.id,
                });
                setError(true);
            })
            .finally(() => {
                setLoader(false);
            });
    };

    const readonlyClass = readonly ? '!cursor-not-allowed opacity-50' : '';

    const inlineView = (noteEditorTitle as string)?.trim() ? (
        <>
            {notes.map((item: any, idx: number) => (
                <div key={idx} className="mb-2">
                    <InlineDisplay
                        title={noteEditorTitle as string}
                        value={item.user}
                        required={required}
                    />
                    <InlineDisplay title={title || label} value={item.note} />
                    <InlineDisplay
                        title="Posted on"
                        value={convertKebabedDateString(
                            item.createdAt,
                            DEFAULT_EXTENDED_DATE_FORMAT
                        )}
                    />
                </div>
            ))}
        </>
    ) : (
        <InlineDisplay
            title={title || label}
            value={notes}
            required={required}
        />
    );

    const widgetView = (
        <div className="flex w-[400px] flex-col">
            <div className="font-primary text-2xl mt-2">{t('noteTitle')}</div>
            <div
                className={`w-full border-2 border-gray-200 mt-2 min-h-[100px] rounded-lg `}
            >
                <textarea
                    className={`${readonlyClass} mt-1 w-full min-h-[100px] resize-none border-none text-md px-4 py-2 !outline-none !ring-0`}
                    onChange={(e) => {
                        setCurrentNote(e?.target?.value ?? '');
                    }}
                    placeholder={t('notePlaceholder') ?? ''}
                    disabled={disabled || readonly}
                    value={currentNote as string}
                ></textarea>
            </div>
            <Button
                mode="secondary"
                className="w-fit mt-4 mb-2 px-xs py-2xl min-w-[100px]"
                size="small"
                disabled={currentNote.trim() === '' || loader}
                onClick={() => {
                    addNote();
                }}
            >
                {loader ? <CustomLoader /> : t('addNote')}
            </Button>
            {error && (
                <AssistiveText
                    text={t('errorSavingNote')}
                    variant={AssistiveTextVariant.Error}
                />
            )}
            {!inlineWithWidget &&
                notes?.map((note: any, index: number) => (
                    <div key={index} className="gap-lg mt-2 mb-2">
                        <Content
                            variant={ContentVariant.BodySm}
                            className="!font-medium"
                            details={note.note}
                        />
                        <Content
                            variant={ContentVariant.BodySmBold}
                            className="mt-2 text-[#676767] block !font-semibold"
                            details={
                                t('notePostDate', {
                                    date: convertKebabedDateString(
                                        note.createdAt,
                                        DEFAULT_EXTENDED_DATE_FORMAT
                                    ),
                                }) ?? ''
                            }
                        />
                        <Content
                            variant={ContentVariant.BodyBold}
                            className="mt-2 block"
                            details={note.user}
                        />
                    </div>
                ))}
        </div>
    );

    if (inlineWithWidget) {
        return (
            <>
                {inlineView}
                {widgetView}
            </>
        );
    }

    if (inline) {
        return inlineView;
    }

    return widgetView;
}
