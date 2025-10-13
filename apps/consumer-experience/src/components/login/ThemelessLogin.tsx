import ZinniaLogoIcon from '@/app/styles/assets/zinnia-logo-icon.svg';
import styles from '@/components/generic-info-page/GenericInfoPage.module.css';

import { Footer } from '../footer/Footer';

export const ThemelessLogin = () => {
  return (
    <div className={styles.container}>
      {<div className={`${styles.banner} ${styles.mypolicyview}`} />}
      <div className={`${styles.scrollContainer} typography-content-body-sm`}>
        <div className={styles.content}>
          <div className={styles.details}>
            <h1>
              <ZinniaLogoIcon
                height={41}
                alt="MyPolicyView Logo"
                style={{ display: 'inline', marginLeft: '-10px' }}
              />
              <span>MyPolicyView</span>
            </h1>
            <div>
              <p className="typography-titles-subtitle-alt">
                Part of{' '}
                <a
                  href="https:zinnia.com/platforms/zinnia-now/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Zinnia Now
                </a>{' '}
                &{' '}
                <a
                  href="https:zinnia.com/platforms/zinnia-launch/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Zinnia Launch
                </a>
              </p>
            </div>
            <p>
              MyPolicyView is a secure self-service platform for managing life
              insurance policies and annuity contracts. Make payments, update
              details, and manage coverage—all in one place with MyPolicyView.
            </p>
            <div>
              <h2 className="mb-lg">Trying to Sign In?</h2>
              <p>
                Visit your insurance carrier's website directly to access your
                policy on MyPolicyView.
              </p>
            </div>
          </div>
          <Footer style={{ borderTop: '1px solid #ccc' }} className="pt-xl" />
        </div>
      </div>
    </div>
  );
};
