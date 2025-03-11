
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Icon, IconType } from '@zinnia/bloom/components';

import styles from './Dropdown.module.css';
interface DropdownOption {
  label: string;
  icon?: React.ReactNode;
  onSelect: () => void;
}

interface DropdownProps {
  triggerIcon?: React.ReactNode;
  triggerLabel: string;
  options: DropdownOption[];
}
const Dropdown: React.FC<DropdownProps> = ({ triggerIcon, triggerLabel, options }) => {
  return (
    <DropdownMenu.Root >
      <DropdownMenu.Trigger className="flex text-sm items-center px-2 py-1 gap-1 text-blue-700 bg-blue-50 border-2 border-blue-700 rounded-full w-max z-20" >
        {triggerIcon && <span className="text-lg">{triggerIcon}</span>}
        {triggerLabel && <span className="font-medium">{triggerLabel}</span>}

        <Icon width={15} height={15} className="hidden lg:block" type={IconType.CHEVRON} />

      </DropdownMenu.Trigger>


      <DropdownMenu.Portal >
        <DropdownMenu.Content
          className="bg-white rounded-lg shadow-xl w-32 p-1 z-20"
          sideOffset={5}
        >
          {options.map((option, index) => (
            <DropdownMenu.Item
              key={index}
              onSelect={option.onSelect}
              className={styles.button}
            >
              {option.icon && <span className="text-lg">{option.icon}</span>}
              <span className="text-sm">{option.label}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default Dropdown;
