import { Badge, BadgeVariant, Label } from '@zinnia/bloom/components';

import { SideSheetProps } from '@zinnia/bloom/components';

import { SideSheet } from '@zinnia/bloom/components';

import { License, LicenseStatus } from '../../../types';
import { standardDateMonthDayYear } from '@zinnia/utils';
export interface LicenseSidesheetProps
  extends Omit<SideSheetProps, 'children' | 'header'> {
  license: License;
}

const getBadgeVariant = (status: LicenseStatus): BadgeVariant => {
  switch (status) {
    case LicenseStatus.ACTIVE:
      return BadgeVariant.SUCCESS;
    case LicenseStatus.INACTIVE:
      return BadgeVariant.ERROR;
    default:
      return BadgeVariant.DEFAULT;
  }
};

export const LicenseSidesheet = ({
  trigger,
  license,
  ...props
}: LicenseSidesheetProps) => {
  return (
    <SideSheet header={license.number} trigger={trigger} {...props}>
      <div className="pom_content-wrapper typography-content-body-sm">
        <div>
          <Label>Status</Label>
          <Badge
            label={license.status ?? 'Unknown'}
            variant={getBadgeVariant(license.status)}
          />
        </div>
        <div>
          <Label>License number</Label>
          <span>{license.number}</span>
        </div>
        <div>
          <Label>State</Label>
          <span>{license.state}</span>
        </div>
        <div>
          <Label>Resident</Label>
          <span>{license.resident}</span>
        </div>
        <div>
          <Label>License type</Label>
          <span>{license.type}</span>
        </div>
        <div>
          <Label>Lines of authority</Label>
          <ol className="pom_ordered-list">
            {license.lineOfAuthorities.map((lineOfAuthority) => (
              <li key={lineOfAuthority.type}>{lineOfAuthority.type}</li>
            ))}
          </ol>
        </div>
        <div>
          <Label>Effective date</Label>
          <span>{standardDateMonthDayYear(license.effectiveDate)}</span>
        </div>
        <div>
          <Label>Expiry date</Label>
          <span>{standardDateMonthDayYear(license.expirationDate)}</span>
        </div>
        <div>
          <Label>Inactivation reason</Label>
          <span>{license.inactivationReason}</span>
        </div>
        <div>
          <Label>Suspension start date</Label>
          <span>{standardDateMonthDayYear(license.suspensionStartDate)}</span>
        </div>
        <div>
          <Label>Suspension end date</Label>
          <span>{standardDateMonthDayYear(license.suspensionEndDate)}</span>
        </div>
      </div>
    </SideSheet>
  );
};
