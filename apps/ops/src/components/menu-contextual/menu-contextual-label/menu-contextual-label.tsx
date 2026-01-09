import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export interface MenuContextualLabelProps {
    children: React.ReactNode;
    label: string;

    hideLabel?: boolean;
}

const MenuContextualLabel = ({
    label,
    children,
    hideLabel = false,
}: MenuContextualLabelProps) => {
    return (
        <DropdownMenu.Label className="flex w-full flex-col gap-4">
            <p
                className={`flex items-start gap-2 self-stretch px-4 font-primary text-base font-medium text-white ${
                    hideLabel ? 'sr-only' : ''
                }`}
            >
                {label}
            </p>
            <ul className="flex flex-col gap-4">{children}</ul>
        </DropdownMenu.Label>
    );
};

export default MenuContextualLabel;
