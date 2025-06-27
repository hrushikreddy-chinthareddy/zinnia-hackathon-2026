import { Email, EmailBase, EmailType } from '@zinnia/api-types/types/sor';
import { TFunction, useTranslation } from 'next-i18next';

import Label, { LabelVariant } from '@deps/components/label/label';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { mapEmailTypeToTranslation } from '@deps/helpers/translation.helpers';

interface GetEmailTypes {
    t: TFunction;
}

interface GetFormErrors {
    caseId?: string;
    email: Email;
    isDelete?: boolean;
    t: TFunction;
}

interface EmailDetailsProps {
    email: EmailBase;
    condensed?: boolean;
}

export interface Errors {
    caseId?: string;
    emailAddress?: string;
}

const EMAIL_REGEX =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

export const getFormErrors = ({
    caseId,
    email,
    isDelete,
    t,
}: GetFormErrors) => {
    const { emailAddress, emailType = EmailType.PERSONAL } = email;

    let errors: Errors = {};

    if (caseId == null) {
        errors = {
            ...errors,
            caseId: `${t('people.sideSheet.email.errors.missingCaseDocument')}`,
        };
    }

    if (isDelete) {
        return errors;
    }

    if (!emailAddress) {
        errors = {
            ...errors,
            emailAddress: t('people.sideSheet.email.errors.isMissing', {
                emailType: mapEmailTypeToTranslation(emailType, t),
            }) as string,
        };
    } else if (!EMAIL_REGEX.test(emailAddress)) {
        errors = {
            ...errors,
            emailAddress: t(
                'people.sideSheet.email.errors.isInvalid'
            ) as string,
        };
    }

    return errors;
};

export const getEmailTypes = ({ t }: GetEmailTypes) => [
    {
        label: t('people.card.email.emailOptions.personal') as string,
        value: EmailType.PERSONAL,
    },
    {
        label: t('people.card.email.emailOptions.business') as string,
        value: EmailType.BUSINESS,
    },
    {
        label: t('people.card.email.emailOptions.other') as string,
        value: EmailType.OTHER,
    },
];

export const EmailDetails = ({
    email,
    condensed = false,
}: EmailDetailsProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.sideSheet.email',
    });
    const { t: defaultT } = useTranslation();

    const { emailAddress, emailType = EmailType.PERSONAL } = email;
    const emailTypeTranslation = mapEmailTypeToTranslation(
        emailType,
        defaultT
    ).toLowerCase();

    return (
        <div className="flex flex-col gap-6">
            {condensed ? (
                <div>
                    <Label
                        label={emailTypeTranslation}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Typography variant={TypographyVariant.BodySm}>
                        {emailAddress}
                    </Typography>
                </div>
            ) : (
                <>
                    <div>
                        <Label
                            label={t('labels.type')}
                            variant={LabelVariant.FieldLabel}
                        />
                        <Typography variant={TypographyVariant.BodySm}>
                            {emailTypeTranslation}
                        </Typography>
                    </div>
                    <div>
                        <Label
                            label={t('labels.email')}
                            variant={LabelVariant.FieldLabel}
                        />
                        <Typography variant={TypographyVariant.BodySm}>
                            {emailAddress}
                        </Typography>
                    </div>
                </>
            )}
        </div>
    );
};
