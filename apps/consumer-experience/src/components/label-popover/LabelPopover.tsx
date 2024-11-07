import { Icon, IconType, Popover } from '@zinnia/bloom/components';
import { toSentenceCase } from '@zinnia/utils';

export const LabelPopover = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <Popover
      title={toSentenceCase(title)}
      trigger={
        <Icon
          type={IconType.CIRCLE_INFO}
          color="var(--color-base-icon-icon-tooltip)"
          small
        />
      }
    >
      <div className="typography-content-body-sm">{children}</div>
    </Popover>
  );
};
