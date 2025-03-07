import React, { useState } from 'react'
import { Button } from '@zinnia/bloom/components';
import Field, { FieldSize, FieldType } from '@deps/components/fields/field';
import Content, { ContentVariant } from '@deps/components/content/content';

export default function NotesSidesheeet({ taskId}: {taskId: string}) {

  const [notes, setNotes] = useState([{"title": "Note1 Aote1", "date": "2/7/2025", "user":"Ryan Zinnia"}, {"title": "Note2 Aote1", "date": "2/7/2025", "user":"Cyan Zinnia"}]);

  const [currentNote, setCurrentNote] = useState('');



  return (
    <div className='flex px-10 w-full flex-col '>
     <label className="font-primary text-2xl mt-8">Notes</label>

      <div className={`border-2 border-gray-200 px-2 pt-2 mt-6 rounded-lg`}>
      <Field
                    onChange={e => {
                      setCurrentNote((e?.target?.value?.trim()) ?? '');
                    }}

                    onKeyPress={e => {
                        if (e.key === ',' || e.key === ';') {
                            e.preventDefault();
                            // addEmail(email);
                        }
                    }}
                    onBlur={e => {
                        e.preventDefault();
                        // addEmail(email);
                    }}
                    value={currentNote as string}
                    size={FieldSize.Default}
                    type={FieldType.BaseActive}
                    className="!border-0 max-w-xs"
                />
            </div>



      <Button mode='secondary' className='mt-4 mb-6 px-xs py-2xl' size='small'>Add note</Button>

        {notes.map(note => (
          <div className='gap-lg mt-4'>
            {/* <label className='font-primary text-lg'>{note.title}</label> */}
            <Content
                                className="text-500"
                                variant={ContentVariant.BodySm}
                                details={note.title}
                            />
            <p className='text-sm'>{note.date} </p>
            <p className='text-sm'>{note.user}</p>
          </div>
        ))}




    </div>

  )
}