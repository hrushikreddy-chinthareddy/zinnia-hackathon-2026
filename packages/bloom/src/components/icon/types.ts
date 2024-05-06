// import CloudFilled from '../tokens/svg-assets/icons/cloud_filled.svg';
import Alert from '../../tokens/svg-assets/icons/alert/alert.svg';
import AlertExclamation from '../../tokens/svg-assets/icons/alert/alert-exclamation.svg';
import Autopay from '../../tokens/svg-assets/icons/currency/autopay.svg';
import Ban from '../../tokens/svg-assets/icons/content/ban.svg';
import Close from '../../tokens/svg-assets/icons/actions/cancel.svg';
import Cog from '../../tokens/svg-assets/icons/brand/cog.svg';
import Payment from '../../tokens/svg-assets/icons/currency/cash.svg';
import Chevron from '../../tokens/svg-assets/icons/chevron.svg';
import ChevronRight from '../../tokens/svg-assets/icons/arrows/chevron-right.svg';
import CircleCheckmark from '../../tokens/svg-assets/icons/circles/circle-checkmark.svg';
import CircleInfo from '../../tokens/svg-assets/icons/circles/circle-info.svg';
import CircleUser from '../../tokens/svg-assets/icons/circles/circle-user.svg';
import Checkmark from '../../tokens/svg-assets/icons/content/check-mark.svg';
import Clock from '../../tokens/svg-assets/icons//illustrations/clock.svg';
import Cloud from '../../tokens/svg-assets/icons/media/cloud.svg';
import Dashboard from '../../tokens/svg-assets/icons/navigation/dashboard.svg';
import Database from '../../tokens/svg-assets/icons/illustrations/database.svg';
import Dollar from '../../tokens/svg-assets/icons/currency/currency-dollars.svg';
import DocumentDuplicate from '../../tokens/svg-assets/icons/file/document-duplicate.svg';
import DocumentText from '../../tokens/svg-assets/icons/file/document-text.svg';
import Download from '../../tokens/svg-assets/icons/file/download.svg';
import Frown from '../../tokens/svg-assets/icons/brand/emoji-frown.svg';
import HexExclamation from '../../tokens/svg-assets/icons/alert/hex-exclamation.svg';
import Lightbulb from '../../tokens/svg-assets/icons/illustrations/light-bulb.svg';
import Logout from '../../tokens/svg-assets/icons/actions/logout.svg';
import Mail from '../../tokens/svg-assets/icons/communications/mail.svg';
import Phone from '../../tokens/svg-assets/icons/communications/phone.svg';
import Settings from '../../tokens/svg-assets/icons/actions/settings.svg';
import Shield from '../../tokens/svg-assets/icons/navigation/shield-heart.svg';
import ShieldCheckmark from '../../tokens/svg-assets/icons/navigation/shield-checkmark.svg';
import ShieldExclamation from '../../tokens/svg-assets/icons/navigation/shield-exclamation.svg';
import Template from '../../tokens/svg-assets/icons/illustrations/template.svg';
import Trash from '../../tokens/svg-assets/icons/actions/trash.svg';
import User from '../../tokens/svg-assets/icons/actions/user.svg';
import UserGroup from '../../tokens/svg-assets/icons/actions/user-group.svg';
import Matches from '../../tokens/svg-assets/icons/media/matches.svg';

export enum IconType {
  ALERT = 'Alert',
  ALERT_EXCLAMATION = 'AlertExclamation',
  AUTOPAY = 'Autopay',
  BAN = 'Ban',
  CANCEL = 'Cancel',
  CHECKMARK = 'Checkmark',
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
  COG = 'Cog',
  DASHBOARD = 'Dashboard',
  DATABASE = 'Database',
  DOCUMENT_DUPLICATE = 'DocumentDuplicate',
  DOCUMENT_TEXT = 'DocumentText',
  DOLLAR = 'Dollar',
  DOWNLOAD = 'Download',
  FROWN = 'Frown',
  HEX_EXCLAMATION = 'HexExclamation',
  LIGHTBULB = 'Lightbulb',
  LOGOUT = 'Logout',
  MAIL = 'Mail',
  MATCHES = 'Matches',
  PAYMENT = 'Payment',
  PHONE = 'Phone',
  SETTINGS = 'Settings',
  SHIELD = 'Shield',
  SHIELD_EXCLAMATION = 'ShieldExclamation',
  SHIELD_CHECKMARK = 'ShieldCheckmark',
  TEMPLATE = 'Template1',
  TRASH = 'Trash',
  USER = 'User',
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
  [IconType.ALERT]: Alert,
  [IconType.ALERT_EXCLAMATION]: AlertExclamation,
  [IconType.AUTOPAY]: Autopay,
  [IconType.BAN]: Ban,
  [IconType.CHECKMARK]: Checkmark,
  [IconType.CHEVRON]: Chevron,
  [IconType.CHEVRON_RIGHT]: ChevronRight,
  [IconType.CIRCLE_CHECKMARK]: CircleCheckmark,
  [IconType.CIRCLE_USER]: CircleUser,
  [IconType.CIRCLE_INFO]: CircleInfo,
  [IconType.CLOCK]: Clock,
  [IconType.CLOSE]: Close,
  [IconType.CLOUD]: Cloud,
  [IconType.COG]: Cog,
  [IconType.DASHBOARD]: Dashboard,
  [IconType.DATABASE]: Database,
  // [`${IconType.CLOUD}${FILLED}`]: CloudFilled,
  [IconType.DOCUMENT_DUPLICATE]: DocumentDuplicate,
  [IconType.DOCUMENT_TEXT]: DocumentText,
  [IconType.DOLLAR]: Dollar,
  [IconType.DOWNLOAD]: Download,
  [IconType.FROWN]: Frown,
  [IconType.HEX_EXCLAMATION]: HexExclamation,
  [IconType.LIGHTBULB]: Lightbulb,
  [IconType.LOGOUT]: Logout,
  [IconType.MAIL]: Mail,
  [IconType.MATCHES]: Matches,
  [IconType.PAYMENT]: Payment,
  [IconType.PHONE]: Phone,
  [IconType.SETTINGS]: Settings,
  [IconType.SHIELD]: Shield,
  [IconType.SHIELD_CHECKMARK]: ShieldCheckmark,
  [IconType.SHIELD_EXCLAMATION]: ShieldExclamation,
  [IconType.TEMPLATE]: Template,
  [IconType.TRASH]: Trash,
  [IconType.USER]: User,
  [IconType.USER_GROUP]: UserGroup,
};
