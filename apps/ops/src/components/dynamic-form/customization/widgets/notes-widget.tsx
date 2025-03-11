import { WidgetProps } from '@rjsf/utils';
import { Button } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import React, { useContext, useState } from 'react'

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import Content, { ContentVariant } from '@deps/components/content/content';
import Field, { FieldSize, FieldType } from '@deps/components/fields/field';

import { useUser } from '@auth0/nextjs-auth0/client';
import CustomLoader from '@deps/components/loader/customLoader';
import { TaskDataContext } from '@deps/containers/task-container/task-context';
import { updateTask } from '@deps/containers/task-container/task.helper';
import { reverseNameOrder } from '@deps/helpers/string.helper';
import { TaskStatus } from '@deps/models/case/task-instance';

export default function NotesWidget(props:WidgetProps) {

  const { formContext } = props;
  const [notes, setNotes] = useState(formContext?.customData?.notes || []);
  const [currentNote, setCurrentNote] = useState('');
  const { user } = useUser();
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [errorSavingNote, setErrorSavingNote] = useState(false);

  const formState = useContext(TaskDataContext);
  const { correlationId, initialTask } = formState;

  const addNote = async() => {
    setErrorSavingNote(false);
    const timestamp = dayjs().utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
      const newNote = {
        note: currentNote.trim(),
        createdAt: timestamp,
        user: reverseNameOrder(user?.name ?? "")
    };
    const updatedNotes = [newNote, ...notes];

    const noteTask = {
        ...initialTask,
        data: {
            ...initialTask.data,
            notes: updatedNotes,
        },
    };
    setIsSavingNote(true);
    updateTask(noteTask, correlationId, TaskStatus.InProgress)
        .then(success => {
            if (success) {
                setNotes(updatedNotes);
                setCurrentNote('');
                console.log('Task updated and notes set successfully');
            } else {
                console.warn('Task update failed, not updating notes.');
                setErrorSavingNote(true);
            }
        })
        .catch(error => {
            console.error('Error updating task:', error);
            setErrorSavingNote(true);
        }).finally(() => {
            setIsSavingNote(false);
        });
  }

  return (
      <div className="flex w-full flex-col">
          <div className="font-primary text-2xl mt-8">Notes</div>
          <div className={`w-full border-2 border-gray-200 px-2 pt-2 mt-6 rounded-lg `}>
              <Field
                  onChange={e => {
                      setCurrentNote(e?.target?.value ?? '');
                  }}
                  onKeyPress={e => {
                      if (e.key === ',' || e.key === ';') {
                          e.preventDefault();
                      }
                  }}
                  onBlur={e => {
                      e.preventDefault();
                  }}
                  value={currentNote as string}
                  size={FieldSize.Default}
                  type={FieldType.BaseActive}
                  className="!border-0 w-full"
                  placeholder="Add a note."
              />
          </div>
          <Button
              mode="secondary"
              className="w-fit mt-4 mb-6 px-xs py-2xl min-w-[100px]"
              size="small"
              disabled={currentNote.trim() === '' ? true : false}
              onClick={() => {
                  addNote();
              }}
          >
              {isSavingNote ? <CustomLoader /> : 'Add note'}
          </Button>
          {errorSavingNote &&  <AssistiveText text= {"Error occurred while saving note. Please try again"} variant={AssistiveTextVariant.Error}/>}
          {notes.map(note => (
              <div className="gap-lg mt-8">
                  <Content variant={ContentVariant.Caption} details={note.note} />
                  <div className="mt-4">
                  <Content
                      className="text-[#676767] text-[13px]"
                      variant={ContentVariant.Body}
                      details={`Posted on ${dayjs(note.createdAt).format('MM/DD/YYYY')} by`}
                  />
                  </div>
                  <div className="mt-2">
                  <Content variant={ContentVariant.BodyBold} details={note.user} />
                  </div>
              </div>
          ))}
      </div>
  );
}