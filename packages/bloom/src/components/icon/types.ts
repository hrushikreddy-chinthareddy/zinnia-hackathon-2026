// import CloudFilled from '../tokens/svg-assets/icons/cloud_filled.svg';
import AlertExclamation from '../../tokens/svg-assets/icons/alert/alert-exclamation.svg';
import Autopay from '../../tokens/svg-assets/icons/currency/autopay.svg';
import Close from '../../tokens/svg-assets/icons/actions/cancel.svg';
import Payment from '../../tokens/svg-assets/icons/currency/cash.svg';
import Chevron from '../../tokens/svg-assets/icons/chevron.svg';
import CircleCheckmark from '../../tokens/svg-assets/icons/circles/circle-checkmark.svg';
import CircleInfo from '../../tokens/svg-assets/icons/circles/circle-info.svg';
import CircleUser from '../../tokens/svg-assets/icons/circles/circle-user.svg';
import Clock from '../../tokens/svg-assets/icons//illustrations/clock.svg';
import Cloud from '../../tokens/svg-assets/icons/media/cloud.svg';
import Dashboard from '../../tokens/svg-assets/icons/navigation/dashboard.svg';
import Dollar from '../../tokens/svg-assets/icons/currency/currency-dollars.svg';
import DocumentText from '../../tokens/svg-assets/icons/file/document-text.svg';
import Frown from '../../tokens/svg-assets/icons/brand/emoji-frown.svg';
import HexExclamation from '../../tokens/svg-assets/icons/alert/hex-exclamation.svg';
import Lightbulb from '../../tokens/svg-assets/icons/illustrations/light-bulb.svg';
import Logout from '../../tokens/svg-assets/icons/actions/logout.svg';
import Mail from '../../tokens/svg-assets/icons/communications/mail.svg';
import Shield from '../../tokens/svg-assets/icons/navigation/shield-heart.svg';
import Trash from '../../tokens/svg-assets/icons/actions/trash.svg';
import UserGroup from '../../tokens/svg-assets/icons/actions/user-group.svg';

export enum IconType {
  ALERT_EXCLAMATION = 'AlertExclamation',
  AUTOPAY = 'Autopay',
  CANCEL = 'Cancel',
  CHEVRON = 'Chevron',
  CIRCLE_CHECKMARK = 'CircleCheckmark',
  CIRCLE_INFO = 'CircleInfo',
  CIRCLE_USER = 'CircleUser',
  CLOCK = 'Clock',
  /**
   * Referred to as cancel in the designs
   */
  CLOSE = 'Close',
  CLOUD = 'Cloud',
  DASHBOARD = 'Dashboard',
  DOCUMENT_TEXT = 'DocumentText',
  DOLLAR = 'Dollar',
  FROWN = 'Frown',
  HEX_EXCLAMATION = 'HexExclamation',
  LIGHTBULB = 'Lightbulb',
  LOGOUT = 'Logout',
  MAIL = 'Mail',
  PAYMENT = 'Payment',
  SHIELD = 'Shield',
  TRASH = 'Trash',
  USER_GROUP = 'UserGroup',
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

export const Icons: {
  [key: string]: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined;
    }
  >;
} = {
  [IconType.ALERT_EXCLAMATION]: AlertExclamation,
  [IconType.AUTOPAY]: Autopay,
  [IconType.CHEVRON]: Chevron,
  [IconType.CIRCLE_CHECKMARK]: CircleCheckmark,
  [IconType.CIRCLE_USER]: CircleUser,
  [IconType.CIRCLE_INFO]: CircleInfo,
  [IconType.CLOCK]: Clock,
  [IconType.CLOSE]: Close,
  [IconType.CLOUD]: Cloud,
  [IconType.DASHBOARD]: Dashboard,
  // [`${IconType.CLOUD}${FILLED}`]: CloudFilled,
  [IconType.DOCUMENT_TEXT]: DocumentText,
  [IconType.DOLLAR]: Dollar,
  [IconType.FROWN]: Frown,
  [IconType.HEX_EXCLAMATION]: HexExclamation,
  [IconType.LIGHTBULB]: Lightbulb,
  [IconType.LOGOUT]: Logout,
  [IconType.MAIL]: Mail,
  [IconType.PAYMENT]: Payment,
  [IconType.SHIELD]: Shield,
  [IconType.TRASH]: Trash,
  [IconType.USER_GROUP]: UserGroup,
};
