import { SVGProps } from 'react';

import CloudFilled from '@/app/styles/icons/icons_filled/cloud.svg';
import Autopay from '@/app/styles/icons/icons_outlined/autopay.svg';
import Close from '@/app/styles/icons/icons_outlined/cancel.svg';
import Payment from '@/app/styles/icons/icons_outlined/cash.svg';
import Chevron from '@/app/styles/icons/icons_outlined/chevron-down.svg';
import CircleInfo from '@/app/styles/icons/icons_outlined/circle-info.svg';
import CircleUser from '@/app/styles/icons/icons_outlined/circle-user.svg';
import Cloud from '@/app/styles/icons/icons_outlined/cloud.svg';
import Dollar from '@/app/styles/icons/icons_outlined/currency-dollar.svg';
import DocumentText from '@/app/styles/icons/icons_outlined/document-text.svg';
import Mail from '@/app/styles/icons/icons_outlined/mail.svg';
import Shield from '@/app/styles/icons/icons_outlined/shield-heart.svg';
import Trash from '@/app/styles/icons/icons_outlined/trash.svg';

interface ExtendedSVGProps extends SVGProps<SVGElement> {
  title: string;
}

const FILLED = 'Filled';

export enum IconType {
  AUTOPAY = 'Autopay',
  CANCEL = 'Cancel',
  CHEVRON = 'Chevron',
  CIRCLE_INFO = 'CircleInfo',
  CIRCLE_USER = 'CircleUser',
  /**
   * Referred to as cancel in the designs
   */
  CLOSE = 'Close',
  CLOUD = 'Cloud',
  DOCUMENT_TEXT = 'DocumentText',
  DOLLAR = 'Dollar',
  MAIL = 'Mail',
  PAYMENT = 'Payment',
  SHIELD = 'Shield',
  TRASH = 'Trash',
}

export interface IconProps {
  type: IconType;
  /**
   * if icon is semantically meaningful to the content, include alt describe to describe the icon
   */
  alt?: string;
  color?: string;
  width?: number;
  height?: number;
  filled?: boolean;
  className?: string;
}

export const Icons: {
  [key: string | IconType]: string;
} = {
  [IconType.AUTOPAY]: Autopay,
  [IconType.CHEVRON]: Chevron,
  [IconType.CIRCLE_USER]: CircleUser,
  [IconType.CIRCLE_INFO]: CircleInfo,
  [IconType.CLOSE]: Close,
  [IconType.CLOUD]: Cloud,
  [`${IconType.CLOUD}${FILLED}`]: CloudFilled,
  [IconType.DOCUMENT_TEXT]: DocumentText,
  [IconType.DOLLAR]: Dollar,
  [IconType.MAIL]: Mail,
  [IconType.PAYMENT]: Payment,
  [IconType.SHIELD]: Shield,
  [IconType.TRASH]: Trash,
};

export const Icon = ({
  type,
  width,
  height,
  color,
  filled,
  className,
  alt,
}: IconProps) => {
  const iconType = filled ? `${type}${FILLED}` : type;
  const Icon = Icons[iconType];

  // TODO: default to outlined?
  if (!Icon) {
    return null;
  }

  const props = {
    width: width || 24,
    height: height || 24,
    className: `inline ${className}`,
    color,
  } as ExtendedSVGProps;

  if (alt) {
    props.role = 'img';
    props.title = alt;
  }

  if (!alt) {
    props['aria-hidden'] = true;
  }

  return <Icon {...props} />;
};
