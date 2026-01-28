import { TFunction, useTranslation } from 'next-i18next';

import { Label, LabelVariant } from '@deps/components/label/label';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';

export interface Errors {
    caseId?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    supportingDocumentMatchesWithNewName?: string;
    signaturePresentOnDocumentForAllOwners?: string;
    dateOfSignature?: string;
    supportingDocumentRequired?: string;
}
export interface GetFormErrors {
    caseId?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    type?: string;
    supportingDocumentMatchesWithNewName?: string;
    signaturePresentOnDocumentForAllOwners?: string;
    t: TFunction;
    dateOfSignature?: string;
    uploadedFiles: File[];
}

interface NameDetailsProps {
    name: string;
}

export const NameDetails = ({ name }: NameDetailsProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.sideSheet.name',
    });

    return (
        <div className="flex flex-col gap-6">
            <div>
                <Label
                    label={t('fullName')}
                    variant={LabelVariant.FieldLabel}
                />
                <Typography variant={TypographyVariant.BodySm}>
                    {name}
                </Typography>
            </div>
        </div>
    );
};

const isEmpty = (value?: string) => !value || value.trim() === '';

export const getFormErrors = ({
    caseId,
    firstName,
    lastName,
    fullName,
    t,
    type,
    supportingDocumentMatchesWithNewName,
    signaturePresentOnDocumentForAllOwners,
    dateOfSignature,
    uploadedFiles,
}: GetFormErrors): Errors => {
    const errors: Errors = {};

    if (caseId == null) {
        errors.caseId = String(
            t('people.sideSheet.email.errors.missingCaseDocument')
        );
    }

    const isOrg = type === 'ORGANIZATION';
    const isTrust = type === 'TRUST';

    if (isOrg || isTrust) {
        if (isEmpty(fullName)) {
            errors.fullName = String(
                t(
                    isOrg
                        ? 'people.sideSheet.name.errors.organizationError'
                        : 'people.sideSheet.name.errors.trustError'
                )
            );
        }
    } else {
        if (isEmpty(firstName)) {
            errors.firstName = String(
                t('people.sideSheet.name.errors.firstNameError')
            );
        }
        if (isEmpty(lastName)) {
            errors.lastName = String(
                t('people.sideSheet.name.errors.lastNameError')
            );
        }
    }

    if (!uploadedFiles.length) {
        errors.supportingDocumentRequired = String(
            t('allFields.supportingDocumentRequired')
        );
    }

    if (isEmpty(supportingDocumentMatchesWithNewName)) {
        errors.supportingDocumentMatchesWithNewName = String(
            t('allFields.supportingDocumentMatchesWithNewNameRequired')
        );
    }

    if (isEmpty(signaturePresentOnDocumentForAllOwners)) {
        errors.signaturePresentOnDocumentForAllOwners = String(
            t('allFields.signaturePresentOnDocumentRequired')
        );
    }

    if (
        signaturePresentOnDocumentForAllOwners === 'Yes' &&
        isEmpty(dateOfSignature)
    ) {
        errors.dateOfSignature = String(
            t('people.sideSheet.name.errors.dateOfSignature')
        );
    }

    return errors;
};

export const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
};
