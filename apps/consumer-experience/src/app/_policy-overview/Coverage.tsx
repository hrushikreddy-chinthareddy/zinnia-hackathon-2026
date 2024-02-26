import {
  Label,
  Icon,
  IconType,
  Popover,
  PopoverPlacement,
} from '@zinnia/bloom/components-internal';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { formatUSDollars } from '@/utils/currency';

import styles from './PolicyOverview.module.css';

const CoveragePopover = () => {
  return (
    <Popover
      title="Upcoming premium"
      trigger={
        <Icon
          type={IconType.CIRCLE_INFO}
          width={16}
          height={16}
          color="var(--color-primary-color-primary, #ff7500)"
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
          content: (
            <FieldData Label={<Label>Riders</Label>}>
              <p className="typography-content-body-sm">1 of 1 riders</p>
            </FieldData>
          ),
          linkTo: { url: '#', label: 'riders' },
        },
        {
          content: (
            <FieldData Label={<Label>Beneficiary</Label>}>
              <p className="typography-content-body-sm">2 beneficiaries</p>
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
              // eslint-disable-next-line react/jsx-key
              interactiveElements={[<CoveragePopover />]}
            >
              Coverage
            </Label>
          }
          caption="11/4/2022–3/1/2050"
        >
          <p className="typography-content-value">{formatUSDollars(1000000)}</p>
        </FieldData>
      </div>
    </ClickableCardContainer>
  );
};
