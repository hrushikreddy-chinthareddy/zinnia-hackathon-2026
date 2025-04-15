import { useEffect, useState } from 'react';

import CommentSection from './comment-section';
import { useNigoEntry } from '../../nigo-entry-provider';
import { NigoSubException } from '../nigo-details/nigo-details.types';
import { NigoMessages } from '../nigo-details/nigo-messges';

interface NigoOptionDetailsProps {
    selNigoExpetion: string;
    nigoSubExceptions: any;
    nigoExpetion: string;
};

export const NigoOptionDetails = ({selNigoExpetion, nigoSubExceptions, nigoExpetion}: NigoOptionDetailsProps) => {
    const { exceptions, messages, setMessages } = useNigoEntry();
    const [isSelected, setIsSelected] = useState<boolean>(false);
    const subExceptions = nigoSubExceptions?.find((subItem: NigoSubException) => subItem.nmId === selNigoExpetion)?.subExceptions;

    const nigoSubException = subExceptions.find((item: any) => {
        return item.label == 'Validation failed due to reason not listed.'
    }).value;


    const onSubExceptionChange = (nmId: string, selections: any) => {
        setMessages((prevState: any) => {
            if (prevState[nmId]) {
                delete(prevState[nmId]);
            }
            prevState[nmId] = selections;
            return { ...prevState };
        });
    };

    useEffect(() => {
        const selectedMessage = messages[nigoExpetion] ? Object.keys(messages[nigoExpetion]) : [];
        if (selectedMessage.includes(nigoSubException)) {
            setIsSelected(true);
        } else {
            setIsSelected(false);
        }

    }, [messages, nigoExpetion, nigoSubException]);

    return (
        <div className="grid auto-rows-fr grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="flex-1">
                <div key={`{exception-${selNigoExpetion}}`}>
                    { exceptions.includes(selNigoExpetion) && (
                        <NigoMessages
                            index={999}
                            subExceptions={subExceptions}
                            onSubExceptionChange={onSubExceptionChange}
                            nmId={selNigoExpetion}
                            messages={messages[selNigoExpetion] || {}}
                        />
                    )}
              </div>
              { isSelected && <CommentSection /> }
            </div>
        </div>
    );
}

