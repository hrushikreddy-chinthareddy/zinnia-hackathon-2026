export const PLAY_CALL_LOG_URL = '/api/play-call-log-audio';
export const PLAYER_INITIAL_TIME = '0.00';
export const AUDIO_DATE_FORMAT = 'M/D/YYYY h:mm a z';

// Format time from seconds to hh:mm:ss
export const FormatTime = (time: number) => {
    if (isNaN(time)) return '0:00';

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
        return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${
            seconds < 10 ? '0' : ''
        }${seconds}`;
    } else {
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
};

export const DateTimeConfig = {
    defaultLocale: 'en-US',
    defaultTimeZone: 'America/Chicago',
    amPmPattern: /AM|PM/,
    formatAmPm: (match: string) => match.toLowerCase(),
    invalidDateMessage: 'Invalid Date',
    getDateTimeOptions: (timeZone: string): Intl.DateTimeFormatOptions => ({
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short',
    }),
};
