import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { ButtonGroupProps, ConditionalProps } from './types';
import styles from './ButtonGroup.module.css';
import { v4 as uuidv4 } from 'uuid';
import clsx from 'clsx';

export const ButtonGroup = ({
  ariaLabel,
  className,
  defaultValue,
  id,
  inactive,
  items,
  label,
  onClick,
}: ButtonGroupProps) => {
  if (!items || items.length === 0) {
    return null;
  }

  const optionalProps: ConditionalProps = {};
  if (ariaLabel) {
    optionalProps.ariaLabel = ariaLabel;
  }

  return (
    <div>
      {label && label}
      <ToggleGroup.Root
        className={clsx(
          styles.buttonGroup,
          className
        )}
        id={id}
        type="single"
        defaultValue={defaultValue || items[0]?.value}
        onValueChange={onClick}
        {...optionalProps}
      >
        {items.map(({ id, value, children, className }) => {
          if (!id?.length) {
            id = uuidv4();
          }
          return (
            <ToggleGroup.Item
              id={id}
              key={id}
              value={value}
              className={clsx(styles.buttonGroupItem, className)}
              disabled={inactive}
            >
              {children}
            </ToggleGroup.Item>
          );
        })}
      </ToggleGroup.Root>
    </div>
  );
};
