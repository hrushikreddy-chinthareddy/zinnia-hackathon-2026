import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';

import CallAudioPlayer from './call-audio-player';
import { AUDIO_DATE_FORMAT, PLAYER_INITIAL_TIME } from './call-log-utils';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

interface AudioDetailsContent {
    callEntryId?: number;
    callerName?: string;
    createdAt?: string;
    className?: string;
    sessionID?: string;
}

export const AudioDetailsContent: React.FC<AudioDetailsContent> = ({ callEntryId, callerName, createdAt, sessionID }) => {
    const { t } = useTranslation();
    const [audioDuration, setAudioDuration] = useState<string | undefined>(PLAYER_INITIAL_TIME);
    const handleDurationChange = (duration: string) => {
        setAudioDuration(duration);
    };

    const details = [
        { label: t('sideSheet.audioDetailsContent.callId'), value: callEntryId?.toString() },
        { label: t('sideSheet.audioDetailsContent.representative'), value: callerName },
        { label: t('sideSheet.audioDetailsContent.date'), value: dayjs(createdAt).tz().format(AUDIO_DATE_FORMAT) },
        { label: t('sideSheet.audioDetailsContent.totalCallTime'), value: audioDuration?.toString() },
    ];

    return (
        <div className="flex flex-col px-8 py-6 h-full">
            {details.map((detail, index) => (
                <div key={index} className="columns-2 gap-2">
                    <Content className="min-w-max text-gray-600" variant={ContentVariant.BodySm} details={detail.label} />
                    <Content className="min-w-max text-gray-900" variant={ContentVariant.BodySm} details={detail.value} />
                </div>
            ))}
            <div>
                <div className="pt-6">
                    <CallAudioPlayer sessionID={sessionID} onDurationChange={handleDurationChange} />
                </div>
            </div>
        </div>
    );
};
