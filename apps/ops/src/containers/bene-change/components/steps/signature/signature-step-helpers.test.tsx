import { renderHook, act } from '@testing-library/react';
import { TFunction } from 'next-i18next';

import { SignatureFields } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import {
    SignatureValidationTypeWithdrawal,
    SignatureDesignation,
} from '@deps/models/case/renewal/signature-validation';
import { SignatureWithdrawal } from '@deps/models/case/withdrawal/case';

import { useReRegSignatureStepConfig } from './signature-step-helpers';

// Mock translation function
const mockT: TFunction = ((key: string) => key) as TFunction;

describe('useReRegSignatureStepConfig', () => {
    describe('hook initialization', () => {
        it('should return all required properties', () => {
            const { result } = renderHook(() =>
                useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
            );

            expect(result.current.signaturesConfig).toBeDefined();
            expect(result.current.formValidation).toBeDefined();
            expect(result.current.isIrrevocableBene).toBeDefined();
            expect(result.current.setIssirrovocableBene).toBeDefined();
            expect(result.current.setIsOwnerSignGuaranteeStamp).toBeDefined();
            expect(result.current.spousalSignatureStateCodes).toBeDefined();
        });

        it('should initialize isIrrevocableBene as false', () => {
            const { result } = renderHook(() =>
                useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
            );

            expect(result.current.isIrrevocableBene).toBe(false);
        });

        it('should return spousalSignatureStateCodes array', () => {
            const { result } = renderHook(() =>
                useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
            );

            expect(result.current.spousalSignatureStateCodes).toEqual([
                'CA',
                'ID',
                'LA',
                'NM',
                'NV',
                'TX',
                'WI',
            ]);
        });
    });

    describe('signaturesConfig', () => {
        describe('Owner signature configuration', () => {
            it('should always include owner signature configuration', () => {
                const { result } = renderHook(() =>
                    useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
                );

                const ownerConfig = result.current.signaturesConfig.find(
                    (config) =>
                        config.signatureType ===
                        SignatureValidationTypeWithdrawal.Owner
                );

                expect(ownerConfig).toBeDefined();
                expect(ownerConfig?.key).toBe('sig-val-owner');
            });

            it('should include SignatureType, SignaturePresent, SignatureTitle, and SignatureDate fields for owner', () => {
                const { result } = renderHook(() =>
                    useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
                );

                const ownerConfig = result.current.signaturesConfig.find(
                    (config) =>
                        config.signatureType ===
                        SignatureValidationTypeWithdrawal.Owner
                );

                expect(ownerConfig?.fields).toHaveLength(4);
                expect(ownerConfig?.fields[0].component).toBe(
                    SignatureFields.SignatureType
                );
                expect(ownerConfig?.fields[1].component).toBe(
                    SignatureFields.SignaturePresent
                );
                expect(ownerConfig?.fields[2].component).toBe(
                    SignatureFields.SignatureTitle
                );
                expect(ownerConfig?.fields[3].component).toBe(
                    SignatureFields.SignatureDate
                );
            });

            it('should include SignGuaranteeStamp field when isOwnerSignGuaranteeStamp is true and carrierId is FLIC', () => {
                const { result } = renderHook(() =>
                    useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
                );

                // Set isOwnerSignGuaranteeStamp to true
                act(() => {
                    result.current.setIsOwnerSignGuaranteeStamp(true);
                });

                const ownerConfig = result.current.signaturesConfig.find(
                    (config) =>
                        config.signatureType ===
                        SignatureValidationTypeWithdrawal.Owner
                );

                expect(ownerConfig?.fields).toHaveLength(5);
                expect(ownerConfig?.fields[3].component).toBe(
                    SignatureFields.SignGuaranteeStamp
                );
                expect(ownerConfig?.fields[3].key).toBe(
                    'owner-sign-guarantee-stamp'
                );
            });

            it('should NOT include SignGuaranteeStamp field when isOwnerSignGuaranteeStamp is false', () => {
                const { result } = renderHook(() =>
                    useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
                );

                const ownerConfig = result.current.signaturesConfig.find(
                    (config) =>
                        config.signatureType ===
                        SignatureValidationTypeWithdrawal.Owner
                );

                const signGuaranteeField = ownerConfig?.fields.find(
                    (field) =>
                        field.component === SignatureFields.SignGuaranteeStamp
                );

                expect(signGuaranteeField).toBeUndefined();
            });

            it('should NOT include SignGuaranteeStamp field when carrierId is not FLIC', () => {
                const { result } = renderHook(() =>
                    useReRegSignatureStepConfig(mockT, false, 'NY', 'DLIC')
                );

                // Set isOwnerSignGuaranteeStamp to true
                act(() => {
                    result.current.setIsOwnerSignGuaranteeStamp(true);
                });

                const ownerConfig = result.current.signaturesConfig.find(
                    (config) =>
                        config.signatureType ===
                        SignatureValidationTypeWithdrawal.Owner
                );

                const signGuaranteeField = ownerConfig?.fields.find(
                    (field) =>
                        field.component === SignatureFields.SignGuaranteeStamp
                );

                expect(signGuaranteeField).toBeUndefined();
            });

            it('should include customOptions for SignatureTitle field', () => {
                const { result } = renderHook(() =>
                    useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
                );

                const ownerConfig = result.current.signaturesConfig.find(
                    (config) =>
                        config.signatureType ===
                        SignatureValidationTypeWithdrawal.Owner
                );

                const signatureTitleField = ownerConfig?.fields.find(
                    (field) =>
                        field.component === SignatureFields.SignatureTitle
                );

                expect(signatureTitleField?.customOptions).toBeDefined();
                expect(signatureTitleField?.customOptions).toHaveLength(9);
            });
        });

        describe('Joint Owner signature configuration', () => {
            it('should include joint owner signature when isJointOwnerExist is true', () => {
                const { result } = renderHook(() =>
                    useReRegSignatureStepConfig(mockT, true, 'NY', 'FLIC')
                );

                const jointConfig = result.current.signaturesConfig.find(
                    (config) =>
                        config.signatureType ===
                        SignatureValidationTypeWithdrawal.JointOwner
                );

                expect(jointConfig).toBeDefined();
                expect(jointConfig?.key).toBe('sig-val-joint');
            });

            it('should NOT include joint owner signature when isJointOwnerExist is false', () => {
                const { result } = renderHook(() =>
                    useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
                );

                const jointConfig = result.current.signaturesConfig.find(
                    (config) =>
                        config.signatureType ===
                        SignatureValidationTypeWithdrawal.JointOwner
                );

                expect(jointConfig).toBeUndefined();
            });

            it('should include SignatureType, SignaturePresent, SignatureTitle, and SignatureDate fields for joint owner', () => {
                const { result } = renderHook(() =>
                    useReRegSignatureStepConfig(mockT, true, 'NY', 'FLIC')
                );

                const jointConfig = result.current.signaturesConfig.find(
                    (config) =>
                        config.signatureType ===
                        SignatureValidationTypeWithdrawal.JointOwner
                );

                expect(jointConfig?.fields).toHaveLength(4);
                expect(jointConfig?.fields[0].component).toBe(
                    SignatureFields.SignatureType
                );
                expect(jointConfig?.fields[1].component).toBe(
                    SignatureFields.SignaturePresent
                );
                expect(jointConfig?.fields[2].component).toBe(
                    SignatureFields.SignatureTitle
                );
                expect(jointConfig?.fields[3].component).toBe(
                    SignatureFields.SignatureDate
                );
            });

            it('should have shouldDisplay function that returns true for joint owner', () => {
                const { result } = renderHook(() =>
                    useReRegSignatureStepConfig(mockT, true, 'NY', 'FLIC')
                );

                const jointConfig = result.current.signaturesConfig.find(
                    (config) =>
                        config.signatureType ===
                        SignatureValidationTypeWithdrawal.JointOwner
                );

                expect(jointConfig?.shouldDisplay).toBeDefined();
                expect(jointConfig?.shouldDisplay?.()).toBe(true);
            });

            it('should include customOptions for joint owner SignatureTitle field', () => {
                const { result } = renderHook(() =>
                    useReRegSignatureStepConfig(mockT, true, 'NY', 'FLIC')
                );

                const jointConfig = result.current.signaturesConfig.find(
                    (config) =>
                        config.signatureType ===
                        SignatureValidationTypeWithdrawal.JointOwner
                );

                const signatureTitleField = jointConfig?.fields.find(
                    (field) =>
                        field.component === SignatureFields.SignatureTitle
                );

                expect(signatureTitleField?.customOptions).toBeDefined();
                expect(signatureTitleField?.customOptions).toHaveLength(9);
            });
        });

        describe('Irrevocable Beneficiary signature configuration', () => {
            it('should include irrevocable beneficiary signature when isIrrevocableBene is true', () => {
                const { result } = renderHook(() =>
                    useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
                );

                // Set isIrrevocableBene to true
                act(() => {
                    result.current.setIssirrovocableBene(true);
                });

                const irrevocableConfig = result.current.signaturesConfig.find(
                    (config) =>
                        config.signatureType ===
                        SignatureValidationTypeWithdrawal.IrrevocableBeneficiary
                );

                expect(irrevocableConfig).toBeDefined();
                expect(irrevocableConfig?.key).toBe(
                    'sig-val-irrevocable-beneficiary'
                );
            });

            it('should NOT include irrevocable beneficiary signature when isIrrevocableBene is false', () => {
                const { result } = renderHook(() =>
                    useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
                );

                const irrevocableConfig = result.current.signaturesConfig.find(
                    (config) =>
                        config.signatureType ===
                        SignatureValidationTypeWithdrawal.IrrevocableBeneficiary
                );

                expect(irrevocableConfig).toBeUndefined();
            });

            it('should include SignatureType, SignaturePresent, and SignatureDate fields for irrevocable beneficiary', () => {
                const { result } = renderHook(() =>
                    useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
                );

                // Set isIrrevocableBene to true
                act(() => {
                    result.current.setIssirrovocableBene(true);
                });

                const irrevocableConfig = result.current.signaturesConfig.find(
                    (config) =>
                        config.signatureType ===
                        SignatureValidationTypeWithdrawal.IrrevocableBeneficiary
                );

                expect(irrevocableConfig?.fields).toHaveLength(3);
                expect(irrevocableConfig?.fields[0].component).toBe(
                    SignatureFields.SignatureType
                );
                expect(irrevocableConfig?.fields[1].component).toBe(
                    SignatureFields.SignaturePresent
                );
                expect(irrevocableConfig?.fields[2].component).toBe(
                    SignatureFields.SignatureDate
                );
            });
        });

        describe('Spouse signature configuration', () => {
            it('should include spouse signature when ownerState is in spousalSignatureStateCodes and carrierId is FLIC', () => {
                const { result } = renderHook(() =>
                    useReRegSignatureStepConfig(mockT, false, 'CA', 'FLIC')
                );

                const spouseConfig = result.current.signaturesConfig.find(
                    (config) =>
                        config.signatureType ===
                        SignatureValidationTypeWithdrawal.Spouse
                );

                expect(spouseConfig).toBeDefined();
                expect(spouseConfig?.key).toBe('sig-val-spouse');
            });

            it('should include spouse signature for all spousal signature states (CA, ID, LA, NM, NV, TX, WI)', () => {
                const spousalStates = [
                    'CA',
                    'ID',
                    'LA',
                    'NM',
                    'NV',
                    'TX',
                    'WI',
                ];

                spousalStates.forEach((state) => {
                    const { result } = renderHook(() =>
                        useReRegSignatureStepConfig(mockT, false, state, 'FLIC')
                    );

                    const spouseConfig = result.current.signaturesConfig.find(
                        (config) =>
                            config.signatureType ===
                            SignatureValidationTypeWithdrawal.Spouse
                    );

                    expect(spouseConfig).toBeDefined();
                });
            });

            it('should handle lowercase ownerState correctly', () => {
                const { result } = renderHook(() =>
                    useReRegSignatureStepConfig(mockT, false, 'ca', 'FLIC')
                );

                const spouseConfig = result.current.signaturesConfig.find(
                    (config) =>
                        config.signatureType ===
                        SignatureValidationTypeWithdrawal.Spouse
                );

                expect(spouseConfig).toBeDefined();
            });

            it('should NOT include spouse signature when ownerState is not in spousalSignatureStateCodes', () => {
                const { result } = renderHook(() =>
                    useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
                );

                const spouseConfig = result.current.signaturesConfig.find(
                    (config) =>
                        config.signatureType ===
                        SignatureValidationTypeWithdrawal.Spouse
                );

                expect(spouseConfig).toBeUndefined();
            });

            it('should NOT include spouse signature when carrierId is not FLIC', () => {
                const { result } = renderHook(() =>
                    useReRegSignatureStepConfig(mockT, false, 'CA', 'DLIC')
                );

                const spouseConfig = result.current.signaturesConfig.find(
                    (config) =>
                        config.signatureType ===
                        SignatureValidationTypeWithdrawal.Spouse
                );

                expect(spouseConfig).toBeUndefined();
            });

            it('should NOT include spouse signature when ownerState is empty', () => {
                const { result } = renderHook(() =>
                    useReRegSignatureStepConfig(mockT, false, '', 'FLIC')
                );

                const spouseConfig = result.current.signaturesConfig.find(
                    (config) =>
                        config.signatureType ===
                        SignatureValidationTypeWithdrawal.Spouse
                );

                expect(spouseConfig).toBeUndefined();
            });

            it('should include SignatureType, SignaturePresent, and SignatureDate fields for spouse', () => {
                const { result } = renderHook(() =>
                    useReRegSignatureStepConfig(mockT, false, 'CA', 'FLIC')
                );

                const spouseConfig = result.current.signaturesConfig.find(
                    (config) =>
                        config.signatureType ===
                        SignatureValidationTypeWithdrawal.Spouse
                );

                expect(spouseConfig?.fields).toHaveLength(3);
                expect(spouseConfig?.fields[0].component).toBe(
                    SignatureFields.SignatureType
                );
                expect(spouseConfig?.fields[1].component).toBe(
                    SignatureFields.SignaturePresent
                );
                expect(spouseConfig?.fields[2].component).toBe(
                    SignatureFields.SignatureDate
                );
            });
        });

        describe('signaturesConfig reactivity', () => {
            it('should update signaturesConfig when isIrrevocableBene changes', () => {
                const { result } = renderHook(() =>
                    useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
                );

                // Initially no irrevocable beneficiary
                expect(
                    result.current.signaturesConfig.find(
                        (config) =>
                            config.signatureType ===
                            SignatureValidationTypeWithdrawal.IrrevocableBeneficiary
                    )
                ).toBeUndefined();

                // Set isIrrevocableBene to true
                act(() => {
                    result.current.setIssirrovocableBene(true);
                });

                // Now irrevocable beneficiary should be present
                expect(
                    result.current.signaturesConfig.find(
                        (config) =>
                            config.signatureType ===
                            SignatureValidationTypeWithdrawal.IrrevocableBeneficiary
                    )
                ).toBeDefined();
            });

            it('should update signaturesConfig when isOwnerSignGuaranteeStamp changes', () => {
                const { result } = renderHook(() =>
                    useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
                );

                const getOwnerFieldsCount = () => {
                    const ownerConfig = result.current.signaturesConfig.find(
                        (config) =>
                            config.signatureType ===
                            SignatureValidationTypeWithdrawal.Owner
                    );
                    return ownerConfig?.fields.length || 0;
                };

                // Initially 4 fields (without SignGuaranteeStamp)
                expect(getOwnerFieldsCount()).toBe(4);

                // Set isOwnerSignGuaranteeStamp to true
                act(() => {
                    result.current.setIsOwnerSignGuaranteeStamp(true);
                });

                // Now 5 fields (with SignGuaranteeStamp)
                expect(getOwnerFieldsCount()).toBe(5);
            });
        });
    });

    describe('customOptions', () => {
        it('should include all signature designation options', () => {
            const { result } = renderHook(() =>
                useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
            );

            const ownerConfig = result.current.signaturesConfig.find(
                (config) =>
                    config.signatureType ===
                    SignatureValidationTypeWithdrawal.Owner
            );

            const signatureTitleField = ownerConfig?.fields.find(
                (field) => field.component === SignatureFields.SignatureTitle
            );

            const customOptions = signatureTitleField?.customOptions;

            expect(customOptions).toEqual([
                {
                    label: 'selectOption',
                    value: SignatureDesignation.Unselected,
                },
                {
                    label: 'trustee',
                    value: SignatureDesignation.Trustee,
                },
                {
                    label: 'executor',
                    value: SignatureDesignation.Executor,
                },
                {
                    label: 'custodian',
                    value: SignatureDesignation.Custodian,
                },
                {
                    label: 'guardian',
                    value: SignatureDesignation.Guardian,
                },
                {
                    label: 'attorneyInFact',
                    value: SignatureDesignation.AttorneyInFact,
                },
                {
                    label: 'assignee',
                    value: SignatureDesignation.Assignee,
                },
                {
                    label: 'authorizedSignatory',
                    value: SignatureDesignation.AuthorizedSignatory,
                },
                { label: 'na', value: SignatureDesignation.NA },
            ]);
        });

        it('should call translation function for all custom option labels', () => {
            const mockTSpy = jest.fn((key: string) => key) as any as TFunction;

            renderHook(() =>
                useReRegSignatureStepConfig(mockTSpy, false, 'NY', 'FLIC')
            );

            expect(mockTSpy).toHaveBeenCalledWith('selectOption');
            expect(mockTSpy).toHaveBeenCalledWith('trustee');
            expect(mockTSpy).toHaveBeenCalledWith('executor');
            expect(mockTSpy).toHaveBeenCalledWith('custodian');
            expect(mockTSpy).toHaveBeenCalledWith('guardian');
            expect(mockTSpy).toHaveBeenCalledWith('attorneyInFact');
            expect(mockTSpy).toHaveBeenCalledWith('assignee');
            expect(mockTSpy).toHaveBeenCalledWith('authorizedSignatory');
            expect(mockTSpy).toHaveBeenCalledWith('na');
        });
    });

    describe('formValidation function', () => {
        it('should return empty errors when owner signature is present (isSigned is true)', () => {
            const { result } = renderHook(() =>
                useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
            );

            const signatures: SignatureWithdrawal[] = [
                {
                    signType: {
                        text: SignatureValidationTypeWithdrawal.Owner,
                    },
                    isSigned: true,
                } as SignatureWithdrawal,
            ];

            const errors = result.current.formValidation(signatures);

            expect(Object.keys(errors)).toHaveLength(0);
        });

        it('should return empty errors when owner signature is explicitly not present (isSigned is false)', () => {
            const { result } = renderHook(() =>
                useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
            );

            const signatures: SignatureWithdrawal[] = [
                {
                    signType: {
                        text: SignatureValidationTypeWithdrawal.Owner,
                    },
                    isSigned: false,
                } as SignatureWithdrawal,
            ];

            const errors = result.current.formValidation(signatures);

            expect(Object.keys(errors)).toHaveLength(0);
        });

        it('should return error when no choice is made for owner signature (isSigned is undefined)', () => {
            const { result } = renderHook(() =>
                useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
            );

            const signatures: SignatureWithdrawal[] = [
                {
                    signType: {
                        text: SignatureValidationTypeWithdrawal.Owner,
                    },
                    isSigned: undefined,
                } as any,
            ];

            const errors = result.current.formValidation(signatures);

            expect(
                errors[
                    `${SignatureValidationTypeWithdrawal.Owner}SignaturePresent`
                ]
            ).toBe('signatureShouldBePresent');
        });

        it('should return error when no choice is made for owner signature (isSigned is null)', () => {
            const { result } = renderHook(() =>
                useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
            );

            const signatures: SignatureWithdrawal[] = [
                {
                    signType: {
                        text: SignatureValidationTypeWithdrawal.Owner,
                    },
                    isSigned: null,
                } as SignatureWithdrawal,
            ];

            const errors = result.current.formValidation(signatures);

            expect(
                errors[
                    `${SignatureValidationTypeWithdrawal.Owner}SignaturePresent`
                ]
            ).toBe('signatureShouldBePresent');
        });

        it('should handle empty signatures array gracefully', () => {
            const { result } = renderHook(() =>
                useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
            );

            const signatures: SignatureWithdrawal[] = [];

            const errors = result.current.formValidation(signatures);

            expect(Object.keys(errors)).toHaveLength(0);
        });

        it('should handle undefined signatures parameter gracefully', () => {
            const { result } = renderHook(() =>
                useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
            );

            const errors = result.current.formValidation(undefined as any);

            expect(Object.keys(errors)).toHaveLength(0);
        });

        it('should only validate owner signature and ignore other signature types', () => {
            const { result } = renderHook(() =>
                useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
            );

            const signatures: SignatureWithdrawal[] = [
                {
                    signType: {
                        text: SignatureValidationTypeWithdrawal.Owner,
                    },
                    isSigned: true,
                } as SignatureWithdrawal,
                {
                    signType: {
                        text: SignatureValidationTypeWithdrawal.JointOwner,
                    },
                    isSigned: undefined,
                } as any,
            ];

            const errors = result.current.formValidation(signatures);

            // Should not have errors for JointOwner
            expect(Object.keys(errors)).toHaveLength(0);
        });

        it('should call translation function with correct key for error message', () => {
            const mockTSpy = jest.fn((key: string) => key) as any as TFunction;

            const { result } = renderHook(() =>
                useReRegSignatureStepConfig(mockTSpy, false, 'NY', 'FLIC')
            );

            const signatures: SignatureWithdrawal[] = [
                {
                    signType: {
                        text: SignatureValidationTypeWithdrawal.Owner,
                    },
                    isSigned: undefined,
                } as any,
            ];

            result.current.formValidation(signatures);

            expect(mockTSpy).toHaveBeenCalledWith('signatureShouldBePresent');
        });

        it('should handle signatures with missing signType gracefully', () => {
            const { result } = renderHook(() =>
                useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
            );

            const signatures: SignatureWithdrawal[] = [
                {
                    signType: undefined,
                    isSigned: undefined,
                } as any,
            ];

            const errors = result.current.formValidation(signatures);

            expect(Object.keys(errors)).toHaveLength(0);
        });
    });

    describe('state setters', () => {
        it('should update isIrrevocableBene state when setIssirrovocableBene is called', () => {
            const { result } = renderHook(() =>
                useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
            );

            expect(result.current.isIrrevocableBene).toBe(false);

            act(() => {
                result.current.setIssirrovocableBene(true);
            });

            expect(result.current.isIrrevocableBene).toBe(true);

            act(() => {
                result.current.setIssirrovocableBene(false);
            });

            expect(result.current.isIrrevocableBene).toBe(false);
        });

        it('should allow multiple state updates', () => {
            const { result } = renderHook(() =>
                useReRegSignatureStepConfig(mockT, false, 'NY', 'FLIC')
            );

            act(() => {
                result.current.setIssirrovocableBene(true);
                result.current.setIsOwnerSignGuaranteeStamp(true);
            });

            const ownerConfig = result.current.signaturesConfig.find(
                (config) =>
                    config.signatureType ===
                    SignatureValidationTypeWithdrawal.Owner
            );

            const irrevocableConfig = result.current.signaturesConfig.find(
                (config) =>
                    config.signatureType ===
                    SignatureValidationTypeWithdrawal.IrrevocableBeneficiary
            );

            expect(ownerConfig?.fields).toHaveLength(5); // Includes SignGuaranteeStamp
            expect(irrevocableConfig).toBeDefined();
        });
    });

    describe('complex scenarios', () => {
        it('should handle all signature types together (owner, joint, irrevocable, spouse)', () => {
            const { result } = renderHook(() =>
                useReRegSignatureStepConfig(mockT, true, 'CA', 'FLIC')
            );

            act(() => {
                result.current.setIssirrovocableBene(true);
            });

            const signatureTypes = result.current.signaturesConfig.map(
                (config) => config.signatureType
            );

            expect(signatureTypes).toContain(
                SignatureValidationTypeWithdrawal.Owner
            );
            expect(signatureTypes).toContain(
                SignatureValidationTypeWithdrawal.JointOwner
            );
            expect(signatureTypes).toContain(
                SignatureValidationTypeWithdrawal.IrrevocableBeneficiary
            );
            expect(signatureTypes).toContain(
                SignatureValidationTypeWithdrawal.Spouse
            );
            expect(result.current.signaturesConfig).toHaveLength(4);
        });

        it('should handle only owner signature when all conditions are false', () => {
            const { result } = renderHook(() =>
                useReRegSignatureStepConfig(mockT, false, 'NY', 'DLIC')
            );

            expect(result.current.signaturesConfig).toHaveLength(1);
            expect(result.current.signaturesConfig[0].signatureType).toBe(
                SignatureValidationTypeWithdrawal.Owner
            );
        });

        it('should handle owner and joint only (no spouse, no irrevocable)', () => {
            const { result } = renderHook(() =>
                useReRegSignatureStepConfig(mockT, true, 'NY', 'FLIC')
            );

            const signatureTypes = result.current.signaturesConfig.map(
                (config) => config.signatureType
            );

            expect(signatureTypes).toContain(
                SignatureValidationTypeWithdrawal.Owner
            );
            expect(signatureTypes).toContain(
                SignatureValidationTypeWithdrawal.JointOwner
            );
            expect(signatureTypes).not.toContain(
                SignatureValidationTypeWithdrawal.Spouse
            );
            expect(signatureTypes).not.toContain(
                SignatureValidationTypeWithdrawal.IrrevocableBeneficiary
            );
            expect(result.current.signaturesConfig).toHaveLength(2);
        });
    });
});
