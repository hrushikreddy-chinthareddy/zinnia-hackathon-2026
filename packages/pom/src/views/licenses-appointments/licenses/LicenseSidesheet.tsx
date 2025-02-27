import { BadgeVariant } from '@zinnia/bloom/components';
import { SideSheetProps } from '@zinnia/bloom/components';
import { License, LicenseStatus } from '../../../types';
import { standardDateMonthDayYear } from '@zinnia/utils';
import { ViewSidesheet } from '../../../components/view-sidesheet/ViewSidesheet';

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
  const fields = [
    {
      label: 'Status',
      value: license.status ?? 'Unknown',
      isBadge: true,
      badgeVariant: getBadgeVariant(license.status),
    },
    {
      label: 'License number',
      value: license.number,
    },
    {
      label: 'State',
      value: license.state,
    },
    {
      label: 'Resident',
      value: license.resident,
    },
    {
      label: 'License type',
      value: license.type,
    },
    {
      label: 'Lines of authority',
      value: (
        <ol className="pom_ordered-list">
          {license.lineOfAuthorities.map((lineOfAuthority) => (
            <li key={lineOfAuthority.type}>{lineOfAuthority.type}</li>
          ))}
        </ol>
      ),
    },
    {
      label: 'Effective date',
      value: standardDateMonthDayYear(license.effectiveDate),
    },
    {
      label: 'Expiry date',
      value: standardDateMonthDayYear(license.expirationDate),
    },
    {
      label: 'Inactivation reason',
      value: license.inactivationReason,
    },
    {
      label: 'Suspension start date',
      value: standardDateMonthDayYear(license.suspensionStartDate),
    },
    {
      label: 'Suspension end date',
      value: standardDateMonthDayYear(license.suspensionEndDate),
    },
  ];

  return (
    <ViewSidesheet
      header={license.number}
      trigger={trigger}
      fields={fields}
      {...props}
    />
  );
};
