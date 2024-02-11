import { SVGProps } from 'react';

// import CloudFilled from '../tokens/svg-assets/icons/cloud_filled.svg';
import AlertExclamation from '../../tokens/svg-assets/icons/alert/alert-exclamation.svg';
import Autopay from '../../tokens/svg-assets/icons/currency/autopay.svg';
import Close from '../../tokens/svg-assets/icons/actions/cancel.svg';
import Payment from '../../tokens/svg-assets/icons/currency/cash.svg';
import Chevron from '../../tokens/svg-assets/icons/chevron.svg';
import CircleCheckmark from '../../tokens/svg-assets/icons/circles/circle-checkmark.svg';
import CircleInfo from '../../tokens/svg-assets/icons/circles/circle-info.svg';
import CircleUser from '../../tokens/svg-assets/icons/circles/circle-user.svg';
import Cloud from '../../tokens/svg-assets/icons/media/cloud.svg';
import Dollar from '../../tokens/svg-assets/icons/currency/currency-dollars.svg';
import DocumentText from '../../tokens/svg-assets/icons/file/document-text.svg';
import HexExclamation from '../../tokens/svg-assets/icons/alert/hex-exclamation.svg';
import Mail from '../../tokens/svg-assets/icons/communications/mail.svg';
import Shield from '../../tokens/svg-assets/icons/navigation/shield-heart.svg';
import Trash from '../../tokens/svg-assets/icons/actions/trash.svg';

interface ExtendedSVGProps extends SVGProps<SVGElement> {
  title: string;
}

const FILLED = 'Filled';

export enum IconType {
  ALERT_EXCLAMATION = 'AlertExclamation',
  AUTOPAY = 'Autopay',
  CANCEL = 'Cancel',
  CHEVRON = 'Chevron',
  CIRCLE_CHECKMARK = 'CircleCheckmark',
  CIRCLE_INFO = 'CircleInfo',
  CIRCLE_USER = 'CircleUser',
  /**
   * Referred to as cancel in the designs
   */
  CLOSE = 'Close',
  CLOUD = 'Cloud',
  DOCUMENT_TEXT = 'DocumentText',
  DOLLAR = 'Dollar',
  HEX_EXCLAMATION = 'HexExclamation',
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
  small?: boolean;
}

export const Icons: any = {
  [IconType.ALERT_EXCLAMATION]: AlertExclamation,
  [IconType.AUTOPAY]: Autopay,
  [IconType.CHEVRON]: Chevron,
  [IconType.CIRCLE_CHECKMARK]: CircleCheckmark,
  [IconType.CIRCLE_USER]: CircleUser,
  [IconType.CIRCLE_INFO]: CircleInfo,
  [IconType.CLOSE]: Close,
  [IconType.CLOUD]: Cloud,
  // [`${IconType.CLOUD}${FILLED}`]: CloudFilled,
  [IconType.DOCUMENT_TEXT]: DocumentText,
  [IconType.DOLLAR]: Dollar,
  [IconType.HEX_EXCLAMATION]: HexExclamation,
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
  small,
}: IconProps) => {
  const iconType = filled ? `${type}${FILLED}` : type;
  const Icon = Icons[iconType];
  const defaultSize = small ? 16 : 24;

  // TODO: default to outlined?
  if (!Icon) {
    return null;
  }

  const props = {
    width: width || defaultSize,
    height: height || defaultSize,
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
