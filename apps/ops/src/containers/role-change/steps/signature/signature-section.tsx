import { FieldSize } from '@zinnia/bloom/components';
import { useTranslation } from 'react-i18next';

import { FieldType, FieldVariant } from '@deps/components/fields/field';
import FieldDateSelect from '@deps/components/fields/field-date-select/field-date-select';
import Radio, {
    RadioOrientation,
    RadioVariant,
} from '@deps/components/radio/radio';
import SelectSimple from '@deps/components/select/select';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import {
    containerClasses,
    sectionClasses,
    SignatureField,
} from '@deps/constants/policy';
import { getSignatureDesignationOptions } from '@deps/constants/role';
import { useRoleChange } from '@deps/contexts/RoleChangeContext';

import { BooleanOptions } from '../../role-change-helper';

const SignatureSection = ({
    title,
    signature,
    index,
    role,
}: {
    title: string;
    signature: any;
    index: number;
    role: string;
}) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'roleChange.signature',
    });

    const { t: t2 } = useTranslation(undefined, {
        keyPrefix: 'roleChange',
    });

    const { setRoleData } = useRoleChange();
    const signatureDesignationOptions = getSignatureDesignationOptions(t);

    const handleSignatureChange = (index: number, key: any, value: any) => {
        setRoleData((prev: any) => {
            const updatedSignatures = [...(prev.signatures || [])];
            if (!updatedSignatures[index]) {
                updatedSignatures[index] = {};
            }
            updatedSignatures[index] = {
                ...updatedSignatures[index],
                [key]: value,
            };
            return {
                ...prev,
                signatures: updatedSignatures,
            };
        });
    };

    const signPresentoptions = BooleanOptions(t2);

    return (
        <div className={containerClasses} key={index}>
            <div className={sectionClasses}>
                {role !== 'PAYOR' && (
                    <Typography className="mb-8" variant={TypographyVariant.H2}>
                        {title}
                    </Typography>
                )}
                <div
                    className="flex gap-8"
                    key={`signature-${index}-presentornot`}
                >
                    <Radio
                        items={signPresentoptions}
                        orientation={RadioOrientation.Horizontal}
                        onChange={(e) =>
                            handleSignatureChange(
                                index,
                                SignatureField.signPresent,
                                e.target.value
                            )
                        }
                        value={signature.isSignedPresent}
                        required={false}
                        disabled={false}
                        name={`signature-${index}`}
                        variant={RadioVariant.Default}
                        label={t('signaturePresent') as string}
                        id={`signature-${index}`}
                    />
                    <SelectSimple
                        label={t('designation') as string}
                        placeholder={t('selectOption') as string}
                        message={''}
                        onChange={(e) =>
                            handleSignatureChange(
                                index,
                                SignatureField.signDesignation,
                                e
                            )
                        }
                        className="w-[238px]"
                        options={signatureDesignationOptions}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={signature.signDesignation || ''}
                        variant={FieldVariant.Default}
                        data-testid={`signature-designation`}
                        disabled={false}
                    />
                    <FieldDateSelect
                        isFutureDateDisabled={false}
                        label={t('signDate') as string}
                        className="w-[200px]"
                        data-testid={`signature-date`}
                        message={''}
                        onChange={(e) => {
                            handleSignatureChange(
                                index,
                                SignatureField.signDate,
                                e.target.value
                            );
                        }}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={signature.signDate || ''}
                        variant={FieldVariant.Default}
                        disabled={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default SignatureSection;
