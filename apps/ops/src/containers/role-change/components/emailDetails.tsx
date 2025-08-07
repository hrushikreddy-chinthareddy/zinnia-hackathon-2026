import { Email, EmailType } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import Radio, {
    RadioOrientation,
    RadioVariant,
} from '@deps/components/radio/radio';
import { TranslationFiles } from '@deps/config/translations';
import { EmailField } from '@deps/constants/policy';
import { getEmailTypes } from '@deps/containers/people-data-cards/email-card/side-sheet/side-sheet-email.helpers';
import { ExtendedEmail, useRoleChange } from '@deps/contexts/RoleChangeContext';
import { mapEmailTypeToTranslation } from '@deps/helpers/translation.helpers';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

export type EmailProps = {
    emailDetails: ExtendedEmail;
    handleEmailChange: any;
    index: number;
    isReadOnly: boolean;
};

const EmailDetails = ({
    emailDetails,
    handleEmailChange,
    index,
    isReadOnly,
}: EmailProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.sideSheet.email',
    });
    const { t: defaultT } = useTranslation();
    const { currentErrors } = useRoleChange();

    const INITIAL_EMAIL: Email = {
        emailType: EmailType.PERSONAL,
        startDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
    };

    const email = emailDetails || INITIAL_EMAIL;

    const { emailAddress, emailType = EmailType.PERSONAL } = email;

    const emailTypes = getEmailTypes({ t: defaultT });
    const emailTypeTranslation = mapEmailTypeToTranslation(
        emailType,
        defaultT
    ).toLowerCase();

    const emailChangeHandler = (key: EmailField, value: string | boolean) => {
        handleEmailChange(EmailField.Emails, index, key, value);
    };

    const isDelete = email?.remove == true;
    const disabled = isDelete || isReadOnly;

    return (
        <div className="flex justify-between" key={emailType}>
            <div>
                <Radio
                    aria-label={t('labels.type') as string}
                    items={emailTypes}
                    label={t('labels.type') as string}
                    onChange={(event) =>
                        emailChangeHandler(
                            EmailField.EmailType,
                            event.target.value
                        )
                    }
                    value={emailType}
                    orientation={RadioOrientation.Horizontal}
                    name={`emailType-${index}-${Math.random()}`}
                    disabled={disabled}
                    variant={
                        disabled ? RadioVariant.Inactive : RadioVariant.Default
                    }
                    id={`emailType-${index}`}
                />
                <div className="flex flex-col w-full mt-4">
                    <Field
                        aria-label={t('labels.email') as string}
                        label={t('labels.email') as string}
                        message={currentErrors?.email}
                        onChange={(event) => {
                            emailChangeHandler(
                                EmailField.EmailAddress,
                                event.target.value
                            );
                        }}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={emailAddress}
                        variant={
                            disabled
                                ? FieldVariant.Inactive
                                : currentErrors?.email
                                ? FieldVariant.Error
                                : FieldVariant.Default
                        }
                        disabled={disabled}
                    />
                </div>
            </div>
            <CheckboxText
                checked={isDelete}
                label={t('labels.remove')}
                onChange={(e) => {
                    emailChangeHandler(EmailField.Remove, e);
                }}
                isDisabled={isReadOnly}
            />
        </div>
    );
};

export default EmailDetails;
