import CardInfo from '@deps/components/card/card-info/card-info';
import { ReactComponent as HistoryEvent } from '@deps/styles/elements/icons/content/history-event.svg';

const EmptyState = ({
    title,
    subtitle,
}: {
    title: string;
    subtitle: string;
}) => (
    <div className="flex h-[232px] w-full items-center justify-center rounded border-2 border-dashed border-gray-200 bg-gray-50">
        <CardInfo
            icon={
                <HistoryEvent
                    width={50}
                    height={50}
                    className="text-gray-300"
                />
            }
            title={title}
            subtitle={subtitle}
        />
    </div>
);

export default EmptyState;
