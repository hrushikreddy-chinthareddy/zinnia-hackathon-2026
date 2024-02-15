import { Icon, IconType } from "@zinnia/bloom/components";
import { clsx } from "clsx";
import { NextComponentType } from "next";
import Link, { LinkProps } from "next/link";
import { FC, PropsWithChildren, ReactNode } from "react";

import "./clickableCardContainer.css";

interface LinkItem {
  /**
   * Defaults to true
   */
  isInternal?: boolean;
  url: string;
  label: string;
  disabled?: boolean;
}

export interface ChildCard {
  content: ReactNode;
  linkTo?: LinkItem;
}

export interface Props extends PropsWithChildren {
  className?: string;
  disabled?: boolean;
  linkTo?: LinkItem;
  listItems?: ChildCard[];
}

const LinkArrow = ({ url, label, isInternal = true }: LinkItem) => {
  // TODO: add additional handling for 'open in new window or tab
  if (!url) {
    return null;
  }

  const Tag = isInternal
    ? (Link as unknown as NextComponentType<LinkProps>)
    : ("a" as keyof JSX.IntrinsicElements);

  return (
    <Tag
      href={url}
      aria-label={label}
      className="clickable-card-container-primary-action"
    >
      <Icon
        type={IconType.CHEVRON}
        width={20}
        height={20}
        className="clickable-card-container__link-arrow"
      />
    </Tag>
  );
};

export const ClickableCardContainer: FC<Props> = ({
  children,
  className,
  linkTo,
  disabled,
  listItems,
}: Props) => {
  return (
    <div className={`clickable-card-container__container ${className ?? ""}`}>
      <div
        className={`${clsx(
          "clickable-card-container__content",
          disabled && "clickable-card-container__container-disabled"
        )}`}
      >
        {children}
        {linkTo && !disabled && <LinkArrow {...linkTo} />}
      </div>
      {listItems && listItems.length > 0 && (
        <ul>
          {listItems.map((item, index) => (
            <li
              className="clickable-card-container__content clickable-card-container__list-item"
              key={`item-${index}`}
            >
              {item.content}
              {item.linkTo && !disabled && <LinkArrow {...item.linkTo} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
