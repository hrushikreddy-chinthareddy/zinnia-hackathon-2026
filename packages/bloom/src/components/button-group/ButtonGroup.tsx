import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { ButtonGroupProps } from './types';
import styles from './ButtonGroup.module.css';

export const ButtonGroup = ({
  ariaLabel,
  defaultValue,
  items,
  id,
  label,
  onClick,
}: ButtonGroupProps) => {
  if (!items || items.length === 0) {
    return null;
  }

  // TODO: figure out how to type this
  const optionalProps: { [key: string]: any } = {};
  if (ariaLabel) {
    optionalProps['aria-label'] = ariaLabel;
  }

  return (
    <div>
      {label && label}
      <ToggleGroup.Root
        className={styles.buttonGroup}
        id={id}
        type="single"
        defaultValue={defaultValue || items[0]?.value}
        onValueChange={onClick}
        {...optionalProps}
      >
        {items.map((item) => {
          return (
            <ToggleGroup.Item
              value={item.value}
              className={styles.buttonGroupItem}
            >
              {item.children}
            </ToggleGroup.Item>
          );
        })}
      </ToggleGroup.Root>
    </div>
  );
};
