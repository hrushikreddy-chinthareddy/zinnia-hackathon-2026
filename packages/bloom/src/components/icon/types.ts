// import CloudFilled from '../tokens/svg-assets/icons/cloud_filled.svg';
import AlertExclamation from '../../tokens/svg-assets/icons/alert/alert-exclamation.svg';
import Autopay from '../../tokens/svg-assets/icons/currency/autopay.svg';
import Close from '../../tokens/svg-assets/icons/actions/cancel.svg';
import Payment from '../../tokens/svg-assets/icons/currency/cash.svg';
import Chevron from '../../tokens/svg-assets/icons/chevron.svg';
import ChevronRight from '../../tokens/svg-assets/icons/arrows/chevron-right.svg';
import CircleCheckmark from '../../tokens/svg-assets/icons/circles/circle-checkmark.svg';
import CircleInfo from '../../tokens/svg-assets/icons/circles/circle-info.svg';
import CircleUser from '../../tokens/svg-assets/icons/circles/circle-user.svg';
import Clock from '../../tokens/svg-assets/icons//illustrations/clock.svg';
import Cloud from '../../tokens/svg-assets/icons/media/cloud.svg';
import Dashboard from '../../tokens/svg-assets/icons/navigation/dashboard.svg';
import Database from '../../tokens/svg-assets/icons/illustrations/database.svg';
import Dollar from '../../tokens/svg-assets/icons/currency/currency-dollars.svg';
import DocumentText from '../../tokens/svg-assets/icons/file/document-text.svg';
import Download from '../../tokens/svg-assets/icons/file/download.svg';
import Frown from '../../tokens/svg-assets/icons/brand/emoji-frown.svg';
import HexExclamation from '../../tokens/svg-assets/icons/alert/hex-exclamation.svg';
import Lightbulb from '../../tokens/svg-assets/icons/illustrations/light-bulb.svg';
import Logout from '../../tokens/svg-assets/icons/actions/logout.svg';
import Mail from '../../tokens/svg-assets/icons/communications/mail.svg';
import Settings from '../../tokens/svg-assets/icons/actions/settings.svg';
import Shield from '../../tokens/svg-assets/icons/navigation/shield-heart.svg';
import ShieldCheckmark from '../../tokens/svg-assets/icons/navigation/shield-checkmark.svg';
import ShieldExclamation from '../../tokens/svg-assets/icons/navigation/shield-exclamation.svg';
import Trash from '../../tokens/svg-assets/icons/actions/trash.svg';
import UserGroup from '../../tokens/svg-assets/icons/actions/user-group.svg';

export enum IconType {
  ALERT_EXCLAMATION = 'AlertExclamation',
  AUTOPAY = 'Autopay',
  CANCEL = 'Cancel',
  CHEVRON = 'Chevron',
  CHEVRON_RIGHT = 'ChevronRight',
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
  DATABASE = 'Database',
  DOCUMENT_TEXT = 'DocumentText',
  DOLLAR = 'Dollar',
  DOWNLOAD = 'Download',
  FROWN = 'Frown',
  HEX_EXCLAMATION = 'HexExclamation',
  LIGHTBULB = 'Lightbulb',
  LOGOUT = 'Logout',
  MAIL = 'Mail',
  PAYMENT = 'Payment',
  SETTINGS = 'Settings',
  SHIELD = 'Shield',
  SHIELD_EXCLAMATION = 'ShieldExclamation',
  SHIELD_CHECKMARK = 'ShieldCheckmark',
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
  [IconType.CHEVRON_RIGHT]: ChevronRight,
  [IconType.CIRCLE_CHECKMARK]: CircleCheckmark,
  [IconType.CIRCLE_USER]: CircleUser,
  [IconType.CIRCLE_INFO]: CircleInfo,
  [IconType.CLOCK]: Clock,
  [IconType.CLOSE]: Close,
  [IconType.CLOUD]: Cloud,
  [IconType.DASHBOARD]: Dashboard,
  [IconType.DATABASE]: Database,
  // [`${IconType.CLOUD}${FILLED}`]: CloudFilled,
  [IconType.DOCUMENT_TEXT]: DocumentText,
  [IconType.DOLLAR]: Dollar,
  [IconType.DOWNLOAD]: Download,
  [IconType.FROWN]: Frown,
  [IconType.HEX_EXCLAMATION]: HexExclamation,
  [IconType.LIGHTBULB]: Lightbulb,
  [IconType.LOGOUT]: Logout,
  [IconType.MAIL]: Mail,
  [IconType.PAYMENT]: Payment,
  [IconType.SETTINGS]: Settings,
  [IconType.SHIELD]: Shield,
  [IconType.SHIELD_CHECKMARK]: ShieldCheckmark,
  [IconType.SHIELD_EXCLAMATION]: ShieldExclamation,
  [IconType.TRASH]: Trash,
  [IconType.USER_GROUP]: UserGroup,
};
