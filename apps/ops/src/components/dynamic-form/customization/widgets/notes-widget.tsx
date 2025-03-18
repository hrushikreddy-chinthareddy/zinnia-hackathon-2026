import { useUser } from '@auth0/nextjs-auth0/client';
import { WidgetProps } from '@rjsf/utils';
import { Button } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import Content, { ContentVariant } from '@deps/components/content/content';
import CustomLoader from '@deps/components/loader/customLoader';
import { TranslationFiles } from '@deps/config/translations';
import { TaskDataContext } from '@deps/containers/task-container/task-context';
import { updateTask } from '@deps/containers/task-container/task.helper';
import { reverseNameOrder } from '@deps/helpers/string.helper';
import { TaskStatus } from '@deps/models/case/task-instance';
import { DEFAULT_TIMESTAMP_FORMAT } from '@deps/types/constants';
import { browserLogError, browserLogWarn } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

export default function NotesWidget(props: WidgetProps) {
    const { formContext } = props;
    const [notes, setNotes] = useState(formContext?.customData?.notes || []);
    const [currentNote, setCurrentNote] = useState('');
    const { user } = useUser();
    const [loader, setLoader] = useState(false);
    const [error, setError] = useState(false);

    const formState = useContext(TaskDataContext);
    const { task, setTask, correlationId, initialTask } = formState;
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'taskManagementQueue' });

    const addNote = async () => {
        setError(false);
        const timestamp = dayjs().utc().format(DEFAULT_TIMESTAMP_FORMAT);
        const newNote = {
            note: currentNote.trim(),
            createdAt: timestamp,
            user: reverseNameOrder(user?.name ?? ''),
        };
        const updatedNotes = [newNote, ...notes];

        const noteTask = {
            ...initialTask,
            data: {
                ...initialTask.data,
                notes: updatedNotes,
            },
        };
        setLoader(true);
        updateTask(noteTask, correlationId, TaskStatus.InProgress)
            .then(success => {
                if (success) {
                    setNotes(updatedNotes);
                    setTask({
                        ...task,
                        data: {
                            ...task.data,
                            notes: updatedNotes,
                        },
                    });
                    setCurrentNote('');
                } else {
                    browserLogWarn('updateTask::Error updating task', {
                        taskId: task.id,
                    });
                    setError(true);
                }
            })
            .catch(error => {
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

    return (
        <div className="flex w-full flex-col">
            <div className="font-primary text-2xl mt-8">{t('noteTitle')}</div>
            <div className={`w-full border-2 border-gray-200 mt-6 min-h-[100px] rounded-lg `}>
                <textarea
                    className="mt-1 w-full resize-none border-none text-md px-4 py-2 !outline-none !ring-0"
                    onChange={e => {
                        setCurrentNote(e?.target?.value ?? '');
                    }}
                    placeholder={t('notePlaceholder') ?? ''}
                    value={currentNote as string}
                ></textarea>
            </div>
            <Button
                mode="secondary"
                className="w-fit mt-4 mb-6 px-xs py-2xl min-w-[100px]"
                size="small"
                disabled={currentNote.trim() === '' || loader ? true : false}
                onClick={() => {
                    addNote();
                }}
            >
                {loader ? <CustomLoader /> : t('addNote')}
            </Button>
            {error && <AssistiveText text={t('errorSavingNote')} variant={AssistiveTextVariant.Error} />}
            {notes.map((note: any, index: number) => (
                <div key={index} className="gap-lg mt-8">
                    <Content variant={ContentVariant.BodySm} className="!font-medium" details={note.note} />
                    <Content
                        variant={ContentVariant.BodySmBold}
                        className="mt-4 text-[#676767] block !font-semibold"
                        details={t('notePostDate', { date: dayjs(note.createdAt).format('MM/DD/YYYY') }) ?? ''}
                    />
                    <Content variant={ContentVariant.BodyBold} className="mt-2 block" details={note.user} />
                </div>
            ))}
        </div>
    );
}
