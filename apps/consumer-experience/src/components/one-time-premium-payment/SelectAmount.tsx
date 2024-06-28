import {
  Button,
  Icon,
  IconType,
  Label,
  Popover,
  PopoverPlacement,
} from '@zinnia/bloom/components';

import premiumStyles from './OneTimePremiumPayment.module.css';

export const SelectAmount = ({
  moveToNextStep,
}: {
  moveToNextStep?: () => void;
}) => {
  return (
    <>
      <div className="mb-xl">
        <Label>Effective date</Label>
      </div>
      <div className="mb-xl">
        <Label
          interactiveElements={[
            <Popover
              title="popover title"
              trigger={
                <Icon
                  type={IconType.CIRCLE_INFO}
                  small
                  color="var(--color-base-icon-icon-tooltip, #ff7500)"
                />
              }
              placement={PopoverPlacement.BottomRight}
            >
              <div>
                <p>Popover content</p>
              </div>
            </Popover>,
          ]}
        >
          Premium payment amount
        </Label>
      </div>
      {/* // TODO: this only shows if there is a fee */}
      <p className={`${premiumStyles.note} typography-content-body-sm`}>
        Note: Premium payments may have associated fees.
      </p>
      <div className={premiumStyles.buttonGroup}>
        <Button mode="primary" onClick={moveToNextStep}>
          Continue
        </Button>
        {/* TODO: show 'are you sure path', this should actually be a link */}
        <Button mode="link">Cancel</Button>
      </div>
    </>
  );
};
