import { useContext, useEffect, useState } from 'react';

import { RenewalFormDataContext } from '@deps/contexts/OtpRenewalFormContext';

import CommentSection from './comment-section';
import { NIGO_EXCEPTIONS_LABEL } from './service-form-review.helpers';
import { useNigoEntry } from '../../nigo-entry-provider';
import { NigoSubException } from '../nigo-details/nigo-details.types';
import { NigoMessages } from '../nigo-details/nigo-messges';

interface NigoOptionDetailsProps {
    selNigoExpetion: string;
    nigoSubExceptions: any;
    nigoExpetion: string;
    isRenewals: boolean;
}

export const NigoOptionDetails = ({
    selNigoExpetion,
    nigoSubExceptions,
    nigoExpetion,
    isRenewals,
}: NigoOptionDetailsProps) => {
    const { exceptions, messages, setMessages } = useNigoEntry();
    const [isSelected, setIsSelected] = useState<boolean>(false);

    const { setUpfrontNIGO } = useContext(RenewalFormDataContext);

    const subExceptions = nigoSubExceptions?.find(
        (subItem: NigoSubException) => subItem.nmId === selNigoExpetion
    )?.subExceptions;

    let nigoSubException: string = '';

    if (isRenewals) {
        nigoSubException = subExceptions.find((item: any) => {
            return (
                item.label ==
                NIGO_EXCEPTIONS_LABEL.RENEWAL_REQUEST_NOT_SUPPORTED
            );
        })?.value;
    } else {
        nigoSubException = subExceptions.find((item: any) => {
            return (
                item.label ==
                NIGO_EXCEPTIONS_LABEL.VALIDATION_FAILED_REASON_NOT_LISTED
            );
        })?.value;
    }

    const onSubExceptionChange = (nmId: string, selections: any) => {
        setMessages((prevState: any) => {
            if (prevState[nmId]) {
                delete prevState[nmId];
            }
            prevState[nmId] = selections;
            return { ...prevState };
        });

        const upfrontNigo = {
            nigos: [
                {
                    exceptionId: selNigoExpetion,
                    messages: Object.keys(messages[selNigoExpetion]),
                },
            ],
        };
        setUpfrontNIGO(upfrontNigo);
    };

    useEffect(() => {
        const selectedMessage = messages[nigoExpetion]
            ? Object.keys(messages[nigoExpetion])
            : [];

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
                    {exceptions.includes(selNigoExpetion) && (
                        <NigoMessages
                            index={999}
                            subExceptions={subExceptions}
                            onSubExceptionChange={onSubExceptionChange}
                            nmId={selNigoExpetion}
                            messages={messages[selNigoExpetion] || {}}
                        />
                    )}
                </div>
                {isSelected && !isRenewals && <CommentSection />}
            </div>
        </div>
    );
};
