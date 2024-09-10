import CardInfo from '@deps/components/card/card-info/card-info';
import NoNavLayout from '@deps/components/no-nav-layout';
import { ReactComponent as ErrorIcon } from '@deps/styles/elements/icons/icons_outlined/exclamation-alert.svg';

export default function UnsupportedClientForm() {
    return (
        <NoNavLayout displayTopNavBar={false}>
            <div className="flex h-[500px] w-full items-center justify-center rounded border-2 border-dashed border-semantic-warning bg-white shadow-sm">
                <CardInfo
                    icon={<ErrorIcon className="text-semantic-warning" height={50} width={50} />}
                    title="Unsupported carrier"
                    subtitle="Form data is unavailable for this carrier."
                />
            </div>
        </NoNavLayout>
    );
}
