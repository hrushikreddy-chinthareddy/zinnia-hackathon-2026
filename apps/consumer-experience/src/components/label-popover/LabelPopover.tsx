import { Icon, IconType, Popover } from '@zinnia/bloom/components';
import { ReactNode } from 'react';

export const LabelPopover = ({
  title,
  content,
}: {
  title: string;
  content: ReactNode;
}) => {
  return (
    <Popover
      title={title}
      trigger={
        <Icon
          type={IconType.CIRCLE_INFO}
          color="var(--color-base-icon-icon-tooltip, #ff7500)"
          small
        />
      }
    >
      {content}
    </Popover>
  );
};
