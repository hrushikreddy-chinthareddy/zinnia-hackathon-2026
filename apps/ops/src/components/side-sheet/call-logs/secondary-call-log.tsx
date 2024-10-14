import { useTranslation } from 'next-i18next';
import React from 'react';

import CallLogCard from '@deps/components/card/card-call-log/card-call-log';
import FieldData from '@deps/components/fields/field-data/field-data';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { CallLog } from '@deps/models/case/call-log';
import { ReactComponent as LeftArrow } from '@deps/styles/elements/icons/arrow/direction-left-3.svg';

interface SecondaryCallLogProps {
    setFocusedCall: (arg: null) => void;
    call: CallLog;
}

export default function SecondaryCallLog({ call, setFocusedCall }: SecondaryCallLogProps) {
    const { t } = useTranslation();

    return (
        <div>
            <NavElement
                type={NavElementType.Button}
                size={NavElementSize.Small}
                className="m-8 mb-0 flex w-fit items-center"
                startIcon={<LeftArrow height={16} width={16} />}
                onClick={() => setFocusedCall(null)}
            >
                {t('sideSheet.backToCallList')}
            </NavElement>
            <CallLogCard
                callerName={call.callerName}
                callerRole={call.callerType}
                createdAt={call.createdDate}
                tag={call.callType}
                summary={call.callSummary}
                isSecondaryPage
            />
            <div className="p-8">
                <FieldData label={t('sideSheet.callID')} sentenceCase={false}>
                    {call.callEntryID}
                </FieldData>
            </div>
        </div>
    );
}
