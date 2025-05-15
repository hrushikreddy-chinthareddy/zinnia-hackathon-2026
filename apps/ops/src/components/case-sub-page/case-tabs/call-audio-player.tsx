import Content, { ContentVariant } from '@deps/components/content/content';
import React, { useRef, useState, useEffect } from 'react';
import { ReactComponent as ExceptionIcon } from '@deps/styles/elements/icons/icons_outlined/hex-exclamation.svg';
import { ReactComponent as VolumeUp } from '@deps/styles/elements/icons/icons_outlined/volume-up.svg';
import { ReactComponent as VolumeOff } from '@deps/styles/elements/icons/icons_outlined/volume-off.svg';
import { ReactComponent as CirclePlay } from '@deps/styles/elements/icons/circles/circle-play.svg';
import { ReactComponent as CirclePause } from '@deps/styles/elements/icons/circles/circle-pause.svg';
import { useTranslation } from 'next-i18next';
import { browserLogInfo } from '@deps/utils/browser-logging';
import { getAudioLink } from '@deps/queries/api/audio';
import { FormatTime, PLAY_CALL_LOG_URL } from './call-log-utils';

interface ICallAudioPlayer {
    sessionID?: string;
    onDurationChange: (duration: string) => void;
}

const CallAudioPlayer: React.FC<ICallAudioPlayer> = ({ sessionID, onDurationChange }) => {
    const { t } = useTranslation();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isError, setIsError] = useState(false);
    const [links, setLinks] = useState([]);
    const [error, setError] = useState(t('sideSheet.audioDetailsContent.error') as string);

    const [audio, setAudio] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    const fetchAudioUrl = async () => {
        try {
            setLoading(true);
            if (sessionID) {
                const response = await getAudioLink({ sessionID });
                const data = response.data;

                if (data?.links?.length) {
                    setLinks(data.links);
                    return data.links;
                }

                if (data?.message) {
                    setError(data.message);
                    setIsError(true);
                }
            }
        } catch (error) {
            browserLogInfo('call-log-audio-player::Error fetching audio URL', { error });
            setError(t('sideSheet.audioDetailsContent.error') as string);
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    const convertToBlob = async (filePath: string): Promise<string | undefined> => {
        try {
            const response = await fetch(`${PLAY_CALL_LOG_URL}?url=${encodeURIComponent(filePath)}`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            audioRef.current!.src = url;
            return url;
        } catch (error) {
            setIsError(true);
            browserLogInfo('call-log-audio-player::Error while converting blob audio', { error });
            return undefined;
        }
    };

    // Play/Pause Toggle
    const togglePlayPause = async () => {
        if (!links.length) {
            const fetchedUrl = await fetchAudioUrl();
            if (!fetchedUrl?.length || fetchedUrl === undefined) return;
            const blobURL = await convertToBlob(fetchedUrl?.[0]);
            if (blobURL) setAudio(blobURL);
            if (audioRef.current) {
                audioRef.current.load();
                audioRef.current.play();
                setIsPlaying(true);
            }
            return;
        }
        try {
            if (audioRef.current) {
                if (isPlaying) {
                    audioRef.current.pause();
                } else {
                    audioRef.current.play();
                }
                setIsPlaying(!isPlaying);
            }
        } catch (error) {
            browserLogInfo('call-log-audio-player::error while playing audio', { error });
        }
    };

    // Mute/Unmute Toggle
    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    // Update progress bar and current time
    useEffect(() => {
        const updateProgress = () => {
            if (audioRef.current) {
                const newDuration = audioRef.current.duration || 0;
                const newTime = audioRef.current.currentTime || 0;
                setCurrentTime(newTime);
                setDuration(newDuration);

                const newProgress = newDuration > 0 ? (newTime / newDuration) * 100 : 0;
                setProgress(newProgress);
            }
        };

        if (audioRef.current) {
            audioRef.current.addEventListener('timeupdate', updateProgress);
            audioRef.current.addEventListener('loadedmetadata', updateProgress);
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('timeupdate', updateProgress);
                audioRef.current.removeEventListener('loadedmetadata', updateProgress);
            }
        };
    }, []);

    // Update progress bar as audio plays
    useEffect(() => {
        const updateProgress = () => {
            if (audioRef.current) {
                const currentTime = audioRef.current.currentTime;
                const duration = audioRef.current.duration || 0;
                setProgress((currentTime / duration) * 100);
            }
        };

        if (audioRef.current) {
            audioRef.current.addEventListener('timeupdate', updateProgress);
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('timeupdate', updateProgress);
            }
        };
    }, []);

    // Seek to a different position in the audio
    const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            const newDuration = audioRef.current.duration || 0;
            const value = event?.target?.value;
            const newTime = value ? (parseFloat(value) / 100) * newDuration : 0;

            if (!isNaN(newTime) && newDuration > 0) {
                audioRef.current.currentTime = newTime;
                setProgress(parseFloat(event.target.value));
            }
        }
    };

    

    useEffect(() => {
        onDurationChange(FormatTime(duration).toString()); // Send to parent
    }, [duration]);

    return (
        <div>
            <div className="w-full max-w-lg h-10 bg-gray-50 text-black md:p-4 gap-4 rounded-xs flex items-center flex-nowrap">
                <button onClick={togglePlayPause} className="text-white transition">
                    {isPlaying ? (
                        <CirclePause width={24} height={24} className="text-gray-800" />
                    ) : (
                        <CirclePlay width={24} height={24} className="text-gray-800" />
                    )}
                </button>

                <audio ref={audioRef} onEnded={() => setIsPlaying(false)}>
                    <source src={audio} type="audio/mpeg" />
                </audio>

                {/* Play Time Display (0:00 / 4:55) */}
                <Content
                    className="min-w-max text-gray-900"
                    variant={ContentVariant.BodySm}
                    details={`${FormatTime(currentTime)} / ${FormatTime(duration)}`}
                />

                {/* Custom Progress Bar (Without Round Thumb) */}
                <div className="relative h-1 bg-gray-300 rounded-lg flex-grow">
                    <div
                        className="absolute top-0 left-0 h-full bg-[#212121] rounded-lg transition-all"
                        style={{ width: `${progress}%` }}
                    ></div>
                    <input
                        type="range"
                        value={isNaN(progress) ? '0' : progress.toString()}
                        onChange={handleSeek}
                        className="absolute top-0 left-0 w-full h-full opacity-0 rounded-lg cursor-pointer"
                    />
                </div>

                {/* Mute/Unmute Button */}
                <button onClick={toggleMute} className="p-3 text-white transition">
                    {isMuted ? (
                        <VolumeOff width={24} height={24} className="text-gray-800" />
                    ) : (
                        <VolumeUp width={24} height={24} className="text-gray-800" />
                    )}
                </button>
            </div>
            {isError && (
                <div className="flex items-center gap-2">
                    <ExceptionIcon className="text-semantic-error relative top-[4px]" width={16} height={16} />
                    <Content className={'text-semantic-error'} contentClassName="mt-2" variant={ContentVariant.BodySm} details={error} />
                </div>
            )}
        </div>
    );
};

export default CallAudioPlayer;
