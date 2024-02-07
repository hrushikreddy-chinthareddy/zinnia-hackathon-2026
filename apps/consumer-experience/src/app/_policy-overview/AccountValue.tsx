import { Label } from "@zdx/bloom/components";

import { ClickableCardContainer } from "@/components/clickable-card-container/ClickableCardContainer";
import { FieldData } from "@/components/field-data/FieldData";
import { Icon, IconType } from "@/components/icon/Icon";
import { Popover } from "@/components/popover/Popover";
import { PopoverPlacement } from "@/components/popover/popover.helper";
import { Ticker } from "@/components/ticker/Ticker";
import { formatUSDollars } from "@/utils/currency";

import styles from "./policyOverviewCards.module.css";

const AccountValuePopover = () => {
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
          Cha-ching! This is how much money is held in your policy right now.
          Account value grows over time as the premiums you pay are invested and
          earn interest. This money is yours to use how you see fit. You could
          take out a loan against it or even withdraw some for income in
          retirement or to pay for college. Note, though, that withdrawals and
          loans (until paid back) and withdrawals can reduce your death benefit.
          You could also simply let the cash value grow, and eventually use it
          to pay premiums. If you go this route, you’ll just want to keep an eye
          on the account value and the cost of your insurance over time. If the
          policy isn’t funded enough, it could lapse, leaving you without
          coverage.
        </p>
      </div>
    </Popover>
  );
};

// TODO: remove this and the id on the label when bloom label component update has been
// merged to not require label
const idFromTitle = (title: string) => {
  return title.split(" ").join();
};

const ACCOUNT_VALUE = "Account value";

export const AccountValue = () => {
  return (
    <ClickableCardContainer
      linkTo={{ url: "#", isInternal: true, label: "go to internal link" }}
    >
      <div className={styles.content}>
        <Icon type={IconType.DOLLAR} className={styles.icon} />
        <FieldData
          large
          Label={
            <Label
              labelFor={idFromTitle(ACCOUNT_VALUE)}
              interactiveElements={[
                // eslint-disable-next-line react/jsx-key
                <AccountValuePopover />,
              ]}
            >
              {ACCOUNT_VALUE}
            </Label>
          }
          fieldData={
            <p
              className="typographyContentValue"
              id={idFromTitle(ACCOUNT_VALUE)}
            >
              {formatUSDollars(250343.12)}
            </p>
          }
          caption="As of 6/12/2023 5:00 pm EST"
        />
        <div className={styles.centerItem}>
          <Ticker value={260.45} subtext="this month" />
        </div>
      </div>
    </ClickableCardContainer>
  );
};
