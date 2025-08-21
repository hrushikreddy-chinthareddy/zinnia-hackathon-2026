import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { Case } from '@deps/models/case/case';
import { EventInstance } from '@deps/models/case/event-instance';

const Event = ({ event, index }: { event: EventInstance; index: number }) => {
    const isLeft = index % 2 === 0;
    const eventDescription = (
        <ul>
            <li>{event.source}</li>
            <li>{event.correlationId}</li>
            {event.identifiers.map((identifier, i) => {
                return (
                    <li
                        className="text-gray-300 typography-content-body-sm"
                        key={i}
                    >
                        {identifier.identifier}: {identifier.value}
                    </li>
                );
            })}
        </ul>
    );
    const eventDate = dayjs(event.eventTs).format('M/D/YY h:mm:ss.SSSa');
    return (
        <div className="relative flex w-full py-8">
            {/* Left side */}
            {isLeft ? (
                <div className="w-1/2 pr-8 text-right">
                    <p className="text-sm text-gray-500">{eventDate}</p>
                    <h3 className="text-lg font-semibold">{event.eventName}</h3>
                    <div className="flex justify-end">{eventDescription}</div>
                </div>
            ) : (
                <div className="w-1/2" />
            )}

            {/* Right side */}
            {!isLeft ? (
                <div className="w-1/2 pl-8">
                    <p className="text-sm text-gray-500">{eventDate}</p>
                    <h3 className="text-lg font-semibold">{event.eventName}</h3>
                    <div className="text-gray-700">{eventDescription}</div>
                </div>
            ) : (
                <div className="w-1/2" />
            )}

            {/* Dot on center line, vertically centered to this row */}
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-[7px] z-10 inline-block w-4 h-4 rounded-full bg-blue-500" />
        </div>
    );
};

const Timeline = ({ events }: { events: EventInstance[] }) => {
    const { t } = useTranslation();
    return (
        <div>
            <Typography variant={TypographyVariant.H2}>
                {t(`caseOverview.tabs.events`)}
            </Typography>
            <div className="relative max-w-4xl mx-auto">
                {/* Center vertical line */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-gray-300" />

                {events.map((event, i) => (
                    <Event event={event} index={i} key={event.id} />
                ))}
            </div>
        </div>
    );
};

export default function EventsTab({ caseDetails }: { caseDetails: Case }) {
    const sortedEvents = caseDetails.events.toSorted(
        (a, b) => new Date(a.eventTs).valueOf() - new Date(b.eventTs).valueOf()
    );

    return (
        <CardContainer>
            <Timeline events={sortedEvents} />
        </CardContainer>
    );
}
