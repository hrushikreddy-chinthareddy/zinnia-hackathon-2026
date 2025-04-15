import { useTranslation } from 'next-i18next';
import { Key } from 'react';

import CheckboxText from "@deps/components/checkbox/checkbox-text/checkbox-text";
import Typography, { TypographyVariant } from "@deps/components/typography/typography";
import { TranslationFiles } from '@deps/config/translations';

import { NigoException, NigoSubException } from './nigo-details.types';
import { NigoMessages } from './nigo-messges';
import { useNigoEntry } from '../../nigo-entry-provider';

interface NigoDetailsProps {
    nigoExceptions: any;
    nigoSubExceptions: any;
};

export const NigoDetails = ({nigoExceptions, nigoSubExceptions}: NigoDetailsProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'nigoEntry.nigoDetails' });
    const { exceptions, setExceptions, messages, setMessages } = useNigoEntry();
    const filteredNigoException = nigoExceptions?.find((nigoException: any) => nigoException.label === 'Case routed for manual processing');
    const NIGO_EXCEPTION = filteredNigoException?.value;

    const onExceptionChange = (nmId: string, isChecked: boolean) => {
        setExceptions(prevState => {
            let newState = [];
            if(isChecked) {
                newState = [...prevState, nmId];
            } else {
                prevState.splice(prevState.indexOf(nmId), 1);
                newState = prevState.filter((element: any) => element !== undefined);
                return [...newState];
            }
            return newState;
        });
    };

    const onSubExceptionChange = (nmId: string, selections: any) => {
        setMessages((prevState: any) => {
            if (prevState[nmId]) {
                delete(prevState[nmId]);
            }
            prevState[nmId] = selections;
            return { ...prevState };
        });
    }

    return (
        <>
            <Typography variant={TypographyVariant.LabelMd}>{t('label')}</Typography>
            <div className="mb-5 grid auto-rows-fr grid-cols-1 gap-2 lg:grid-cols-3">
                <div className="flex-1">
                    {nigoExceptions?.map((item: NigoException, index: Key) => {
                        if (item.value === NIGO_EXCEPTION) {
                            return;
                        }
                        const subExceptions = nigoSubExceptions?.find((subItem: NigoSubException) => subItem.nmId === item.value)?.subExceptions;
                        return (
                            <div key={`{exception-${index}}`} className="mt-2">
                                <CheckboxText
                                    checked={exceptions.includes(item.value)}
                                    label={item.label}
                                    onChange={(isChecked: boolean) => onExceptionChange(item.value, isChecked)}
                                />
                                { exceptions.includes(item.value) && (
                                    <NigoMessages
                                        index={index}
                                        subExceptions={subExceptions}
                                        onSubExceptionChange={onSubExceptionChange}
                                        nmId={item.value}
                                        messages={messages[item.value] || {}}
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    );
}

