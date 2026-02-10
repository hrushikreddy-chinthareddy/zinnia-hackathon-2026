import {
    AssistiveText,
    AssistiveTextVariant,
    Button,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import { ButtonSize } from '@deps/components/button/button';
import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import EmailAddress from '@deps/components/otp-send-document/components/email-field';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

import { validateEmail } from '../steps/notification-method/notification-method.helpers';

type EmailCardProps = {
    email: string;
    setEmail: (val: string) => void;
};

const EmailCard = ({ email, setEmail }: EmailCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix:
            'updateNotificationMethodForBeneficiary.updateNotificationMethodStep.notificationMethods',
    });
    const sidesheet = useSideSheetContextLegacy();

    const handleClose = (email: string) => {
        setEmail(email);
        sidesheet.handleOpen(false);
    };

    const handleChangeEmail = () => {
        sidesheet.changeSideSheetContent(
            t('updateEmail'),
            <UpdateEmailAddress
                email={email}
                setEmail={setEmail}
                handleClose={handleClose}
            />
        );
        sidesheet.handleOpen(true);
    };

    return (
        <div className="p-4 border-1 rounded-md border-gray-200 flex justify-between gap-6 items-center w-full">
            <div className="flex flex-col items-start">
                <Typography variant={TypographyVariant.BodyBold}>
                    {t('email')}
                </Typography>
                <span>
                    <PiiWrapper>{email}</PiiWrapper>
                </span>
            </div>
            <div>
                <Button
                    size={ButtonSize.Small}
                    mode="link"
                    onClick={handleChangeEmail}
                >
                    {t('change')}
                </Button>
            </div>
        </div>
    );
};

export default EmailCard;

type UpdateEmailAddressProps = {
    email: string;
    setEmail: (val: string) => void;
    isContainerClass?: boolean;
    isCancel?: boolean;
    handleClose: (val: any) => void;
};

const UpdateEmailAddress = ({
    email: initialEmail,
    setEmail,
    isContainerClass = true,
    isCancel = true,
    handleClose,
}: UpdateEmailAddressProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix:
            'updateNotificationMethodForBeneficiary.updateNotificationMethodStep.notificationMethods',
    });
    const [newEmail, setNewEmail] = useState(initialEmail);
    const [error, setError] = useState<FormValidationErrors>({});

    const handleContinue = () => {
        if (!error.submit) {
            setEmail(newEmail);
            handleClose(newEmail);
        }
    };

    const handleCancel = (event: any) => {
        event.preventDefault();
        handleClose(initialEmail);
    };

    useEffect(() => {
        setError({});
        const emailError = validateEmail(newEmail);
        if (emailError) {
            const newError = { submit: t(emailError) as string };
            setError(newError);
            return;
        } else {
            setError({});
        }
    }, [newEmail, t]);

    return (
        <CardContainer
            classNames={'w-full'}
            containerClassNames={
                isContainerClass ? 'w-full content-divider' : 'w-full'
            }
        >
            <div className="mt-4">
                <EmailAddress email={newEmail} setEmail={setNewEmail} />
                {error?.submit && (
                    <AssistiveText
                        text={error?.submit}
                        variant={AssistiveTextVariant.Error}
                        className="mt-2"
                    />
                )}

                <div className="mt-6 flex ">
                    <Button
                        className="mr-4"
                        onClick={handleContinue}
                        size={ButtonSize.Small}
                    >
                        {t('formActions.continue')}
                    </Button>
                    {isCancel && (
                        <NavElement
                            aria-label={t('cancel') as string}
                            onClick={handleCancel}
                            size={NavElementSize.Small}
                            type={NavElementType.Button}
                            variant={NavElementVariant.Default}
                        >
                            {t('formActions.cancel')}
                        </NavElement>
                    )}
                </div>
            </div>
        </CardContainer>
    );
};
