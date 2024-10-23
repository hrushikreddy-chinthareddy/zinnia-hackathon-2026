import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import { ReactComponent as CircleAlertIcon } from '@deps/styles/elements/icons/circles/circle-exclamation.svg';

export type EmptyCardProps = {
    text: string;
};

export default function EmptyCard({ text }: EmptyCardProps) {
    return (
        <div className="border-box w-full lg:px-[30px]">
            <div className="w-full rounded border-2 border-dashed border-gray-100 bg-gray-50 p-8">
                <AssistiveText
                    text={text}
                    variant={AssistiveTextVariant.Default}
                    iconOverride={<CircleAlertIcon width={16} height={16} />}
                />
            </div>
        </div>
    );
}
