import { Icon, IconType, Popover } from '@zinnia/bloom/components';
import { toSentenceCase } from '@zinnia/utils';
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
      title={toSentenceCase(title)}
      trigger={
        <Icon
          type={IconType.CIRCLE_INFO}
          color="var(--color-base-icon-icon-tooltip, #ff7500)"
          small
        />
      }
    >
      <p className="typography-content-body">{content}</p>
    </Popover>
  );
};
