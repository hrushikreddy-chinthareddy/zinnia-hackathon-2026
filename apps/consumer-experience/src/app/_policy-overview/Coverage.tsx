import { Label } from '@zdx/bloom/components';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { Icon, IconType } from '@/components/icon/Icon';
import { Popover } from '@/components/popover/Popover';
import { PopoverPlacement } from '@/components/popover/popover.helper';
import { formatUSDollars } from '@/utils/currency';

import styles from './policyOverviewCards.module.css';

const CoveragePopover = () => {
  return (
    <Popover
      title="Upcoming premium"
      trigger={
        <Icon
          type={IconType.CIRCLE_INFO}
          width={16}
          height={16}
          color="var(--colorPrimaryColorPrimary, #ff7500)"
        />
      }
      placement={PopoverPlacement.BottomRight}
    >
      <div className={styles.popoverContent}>
        <p>
          Rest assured, you’re insured for this amount as long as your policy is
          active. Your coverage amount is also referred to as the policy’s
          “death benefit.” If something happens to you, your beneficiaries can
          claim this amount.
        </p>
      </div>
    </Popover>
  );
};

export const Coverage = () => {
  return (
    <ClickableCardContainer
      listItems={[
        {
          content: <p className="typographyLabelsFieldLabel">Riders</p>,
          linkTo: { url: '#', label: 'riders' },
        },
        {
          content: (
            <FieldData
              Label={<Label labelFor="policyBeneficiaries">Beneficiary</Label>}
            >
              <p
                id="policyBeneficiaries"
                className="typographyContentCaption field-data__caption"
              >
                2 beneficiaries
              </p>
            </FieldData>
          ),
        },
      ]}
    >
      <div className={styles.content}>
        <Icon type={IconType.SHIELD} className={styles.icon} />
        <FieldData
          large
          Label={
            <Label
              labelFor="Coverage"
              // eslint-disable-next-line react/jsx-key
              interactiveElements={[<CoveragePopover />]}
            >
              Coverage
            </Label>
          }
          caption="11/4/2022–3/1/2050"
        >
          <p className="typographyContentValue">{formatUSDollars(1000000)}</p>
        </FieldData>
      </div>
    </ClickableCardContainer>
  );
};
