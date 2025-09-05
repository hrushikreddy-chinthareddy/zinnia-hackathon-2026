import { convertToBase64, getFormErrors } from './sidesheet-name-card.helpers';

import type { TFunction } from 'i18next';

describe('getFormErrors', () => {
    const t: TFunction = ((key: string) => key) as TFunction;

    it('returns caseId error if caseId is null', () => {
        const errors = getFormErrors({
            caseId: undefined,
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
            t,
            type: 'PERSON',
            supportingDocumentMatchesWithNewName: 'Yes',
            signaturePresentOnDocumentForAllOwners: 'Yes',
            dateOfSignature: '2023-01-01',
            uploadedFiles: [],
        });
        expect(errors.caseId).toBe(
            'people.sideSheet.email.errors.missingCaseDocument'
        );
    });

    it('returns organization fullName error if fullName is empty', () => {
        const errors = getFormErrors({
            caseId: '123',
            firstName: '',
            lastName: '',
            fullName: '',
            t,
            type: 'ORGANIZATION',
            supportingDocumentMatchesWithNewName: 'Yes',
            signaturePresentOnDocumentForAllOwners: 'Yes',
            dateOfSignature: '2023-01-01',
            uploadedFiles: [],
        });
        expect(errors.fullName).toBe(
            'people.sideSheet.name.errors.organizationError'
        );
    });

    it('returns trust fullName error if type is TRUST and fullName is empty', () => {
        const errors = getFormErrors({
            caseId: '123',
            firstName: '',
            lastName: '',
            fullName: '',
            t,
            type: 'TRUST',
            supportingDocumentMatchesWithNewName: 'Yes',
            signaturePresentOnDocumentForAllOwners: 'Yes',
            dateOfSignature: '2023-01-01',
            uploadedFiles: [],
        });
        expect(errors.fullName).toBe('people.sideSheet.name.errors.trustError');
    });

    it('returns firstName and lastName errors if type is INDIVIDUAL and names are empty', () => {
        const errors = getFormErrors({
            caseId: '123',
            firstName: '',
            lastName: '',
            fullName: '',
            t,
            type: 'INDIVIDUAL',
            supportingDocumentMatchesWithNewName: 'Yes',
            signaturePresentOnDocumentForAllOwners: 'Yes',
            dateOfSignature: '2023-01-01',
            uploadedFiles: [],
        });
        expect(errors.firstName).toBe(
            'people.sideSheet.name.errors.firstNameError'
        );
        expect(errors.lastName).toBe(
            'people.sideSheet.name.errors.lastNameError'
        );
    });

    it('returns supportingDocumentMatchesWithNewName error if missing', () => {
        const errors = getFormErrors({
            caseId: '123',
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
            t,
            type: 'INDIVIDUAL',
            supportingDocumentMatchesWithNewName: '',
            signaturePresentOnDocumentForAllOwners: 'Yes',
            dateOfSignature: '2023-01-01',
            uploadedFiles: [],
        });
        expect(errors.supportingDocumentMatchesWithNewName).toBe(
            'people.sideSheet.name.errors.supportingDocumentNotMatchesError'
        );
        expect(errors.supportingDocumentRequired).toBeUndefined();
    });

    it('returns signaturePresentOnDocumentForAllOwners error if missing', () => {
        const errors = getFormErrors({
            caseId: '123',
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
            t,
            type: 'INDIVIDUAL',
            supportingDocumentMatchesWithNewName: 'Yes',
            signaturePresentOnDocumentForAllOwners: '',
            dateOfSignature: '2023-01-01',
            uploadedFiles: [],
        });
        expect(errors.signaturePresentOnDocumentForAllOwners).toBe(
            'people.sideSheet.name.errors.signatureNotPresentOnDocument'
        );
    });

    it('returns dateOfSignature error if signaturePresentOnDocumentForAllOwners is Yes and dateOfSignature is missing', () => {
        const errors = getFormErrors({
            caseId: '123',
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
            t,
            type: 'INDIVIDUAL',
            supportingDocumentMatchesWithNewName: 'Yes',
            signaturePresentOnDocumentForAllOwners: 'Yes',
            dateOfSignature: '',
            uploadedFiles: [],
        });
        expect(errors.dateOfSignature).toBe(
            'people.sideSheet.name.errors.dateOfSignature'
        );
    });

    it('returns no errors if all fields are valid', () => {
        const errors = getFormErrors({
            caseId: '123',
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
            t,
            type: 'INDIVIDUAL',
            supportingDocumentMatchesWithNewName: 'Yes',
            signaturePresentOnDocumentForAllOwners: 'Yes',
            dateOfSignature: '2023-01-01',
            uploadedFiles: [
                new File(['x'], 'doc.pdf', { type: 'application/pdf' }),
            ],
        });
        expect(errors).toEqual({});
    });
    it('returns supportingDocumentRequired error if supportingDocumentMatchesWithNewName is set but uploadedFiles is empty', () => {
        const errors = getFormErrors({
            caseId: '123',
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
            t,
            type: 'INDIVIDUAL',
            supportingDocumentMatchesWithNewName: 'Yes',
            signaturePresentOnDocumentForAllOwners: 'Yes',
            dateOfSignature: '2023-01-01',
            uploadedFiles: [],
        });
        expect(errors.supportingDocumentRequired).toBe(
            'people.sideSheet.name.errors.supportingDocumentRequired'
        );
        expect(errors.supportingDocumentMatchesWithNewName).toBeUndefined();
    });
});

describe('convertToBase64', () => {
    it('converts a file to base64 string', async () => {
        const fileContent = 'hello world';
        const blob = new Blob([fileContent], { type: 'text/plain' });
        const file = new File([blob], 'test.txt', { type: 'text/plain' });

        const result = await convertToBase64(file);
        expect(result).toMatch(/^data:text\/plain;base64,/);
    });
});
