import {
  Badge,
  BadgeVariant,
  Label,
  SideSheetProps,
} from '@zinnia/bloom/components';
import { PomSideSheet } from '../pom-sidesheet/PomSidesheet';

export interface ViewSidesheetField {
  label: string;
  value: React.ReactNode;
  isBadge?: boolean;
  badgeVariant?: BadgeVariant;
}

export interface ViewSidesheetProps
  extends Omit<SideSheetProps, 'children' | 'header'> {
  header: string;
  fields: ViewSidesheetField[];
}

export const ViewSidesheet = ({
  trigger,
  header,
  fields,
  ...props
}: ViewSidesheetProps) => {
  return (
    <PomSideSheet header={header} trigger={trigger} {...props}>
      <div className="pom_content-wrapper typography-content-body-sm">
        {fields.map((field, index) => (
          <div key={index}>
            <Label>{field.label}</Label>
            {field.isBadge ? (
              <Badge
                label={field.value as string}
                variant={field.badgeVariant ?? BadgeVariant.DEFAULT}
              />
            ) : (
              field.value
            )}
          </div>
        ))}
      </div>
    </PomSideSheet>
  );
};
