import { Icon, IconType } from '..';
import styles from './BannerAlert.module.css';
import { BannerAlertProps, BannerVariant } from './types';

const icons = {
  [BannerVariant.Default]: IconType.ALERT,
  [BannerVariant.Error]: IconType.HEX_EXCLAMATION,
  [BannerVariant.Information]: IconType.ALERT,
  [BannerVariant.Success]: IconType.ALERT,
  [BannerVariant.Warning]: IconType.ALERT_EXCLAMATION,
};

export const BannerAlert = ({
  bodyText,
  canDismiss,
  cta,
  dismissLabel,
  onDismiss,
  variant,
}: BannerAlertProps) => {
  const bannerVariant = variant || BannerVariant.Default;

  return (
    <div
      className={`${styles.container} ${styles[bannerVariant]}`}
      data-testid="banner-alert"
    >
      <div className={styles.contentContainer}>
        <div>
          <Icon type={icons[bannerVariant]} className={styles.variantIcon} />
        </div>
        <div className={styles.content}>
          <p
            className="typography-content-caption"
            style={{
              color:
                bannerVariant === BannerVariant.Default
                  ? 'var(--color-base-text-text-light)'
                  : 'var(--color-base-text-text-primary)',
            }}
          >
            {bodyText}
          </p>

          {cta && (
            <a
              href={cta.href}
              className={`${styles.cta} typography-nav-links-sm`}
            >
              {cta.text}
            </a>
          )}
        </div>
      </div>

      {!cta && canDismiss && (
        <button aria-label={dismissLabel} onClick={onDismiss}>
          <Icon type={IconType.CLOSE} />
        </button>
      )}
    </div>
  );
};
