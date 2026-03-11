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
import FaxNumber from '@deps/components/otp-send-document/components/fax-field';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import { formatFaxNumber } from '@deps/helpers/string.helpers';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

import styles from './update-notification.module.css';
import { validateFax } from '../steps/notification-method/notification-method.helpers';

type FaxCardProps = {
    fax: string;
    setFax: (val: string) => void;
    isEditable?: boolean;
};

const FaxCard = ({ fax, setFax, isEditable = true }: FaxCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix:
            'updateNotificationMethodForBeneficiary.updateNotificationMethodStep.notificationMethods',
    });
    const sidesheet = useSideSheetContextLegacy();
    const changeLinkClasses = isEditable
        ? styles.changeLinkEnabled
        : styles.changeLinkDisabled;

    const handleClose = (fax: any) => {
        setFax(fax);
        sidesheet.handleOpen(false);
    };

    const handleChangeFax = () => {
        sidesheet.changeSideSheetContent(
            t('updateFax'),
            <UpdateFaxNumber
                fax={fax}
                setFax={setFax}
                handleClose={handleClose}
            />
        );
        sidesheet.handleOpen(true);
    };

    return (
        <div className="p-4 border-1 rounded-md border-gray-200 flex justify-between gap-6 items-center w-full">
            <div className="flex flex-col items-start">
                <Typography variant={TypographyVariant.BodyBold}>
                    {t('fax')}
                </Typography>
                <span>
                    <PiiWrapper>{formatFaxNumber(fax)}</PiiWrapper>
                </span>
            </div>
            <div>
                <Button
                    size={ButtonSize.Small}
                    mode="link"
                    onClick={isEditable ? handleChangeFax : undefined}
                    className={changeLinkClasses}
                >
                    {t('change')}
                </Button>
            </div>
        </div>
    );
};
export default FaxCard;

type UpdateFaxProps = {
    fax: string;
    setFax: (val: string) => void;
    isContainerClass?: boolean;
    isCancel?: boolean;
    handleClose: (val: any) => void;
};

const UpdateFaxNumber = ({
    fax: initialFax,
    setFax,
    isContainerClass = true,
    isCancel = true,
    handleClose,
}: UpdateFaxProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix:
            'updateNotificationMethodForBeneficiary.updateNotificationMethodStep.notificationMethods',
    });
    const [newFax, setNewFax] = useState(initialFax);
    const [error, setError] = useState<FormValidationErrors>({});

    const handleContinue = () => {
        if (!error.submit) {
            setFax(newFax);
            handleClose(newFax);
        }
    };

    const handleCancelClick = (event: any) => {
        event.preventDefault();
        handleClose(initialFax);
    };

    useEffect(() => {
        setError({});
        const faxError = validateFax(newFax);
        if (faxError) {
            const newError = { submit: t(faxError) as string };
            setError(newError);
            return;
        } else {
            setError({});
        }
    }, [newFax, t]);

    return (
        <CardContainer
            classNames={'w-full'}
            containerClassNames={
                isContainerClass ? 'w-full content-divider' : 'w-full'
            }
        >
            <div className="mt-4">
                <FaxNumber fax={newFax} setFax={setNewFax} />
                {error?.submit && (
                    <AssistiveText
                        text={error?.submit}
                        variant={AssistiveTextVariant.Error}
                        className="mt-2"
                    />
                )}

                <div className="mt-6 flex">
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
                            onClick={handleCancelClick}
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
