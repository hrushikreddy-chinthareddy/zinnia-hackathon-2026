import styles from './MfaOptions.module.css';

enum VerificationType {
  SMS = 'sms',
  CALL = 'voice',
}
export const MfaOptions = () => {
  return (
    <fieldset className={styles.mfaOptionsContainer}>
      <div>
        <legend>How would you like to receive the code?</legend>
        <div className={styles.mfaOptions}>
          <label className={styles.mfaOption}>
            <input
              type="radio"
              name="authenticatorType"
              value={VerificationType.SMS}
              defaultChecked
            />
            SMS
          </label>
          <label className={styles.mfaOption}>
            <input
              type="radio"
              name="authenticatorType"
              value={VerificationType.CALL}
            />
            Phone call
          </label>
        </div>
      </div>
    </fieldset>
  );
};
