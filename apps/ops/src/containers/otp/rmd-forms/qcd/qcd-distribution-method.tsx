import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction } from 'react';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@deps/components/button/button';
import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import { DEFAULT_ADDRESS } from '@deps/components/otp-withdrawal-form/address-entry';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormProgram, QCD } from '@deps/models/case/withdrawal/case';

import QcdPaymentDetails from './qcd-payment-details';

const initialQcdPaymentValue = () => ({
    charityName: '',
    amount: {
        text: '',
        amountType: 'DOLLAR',
    },
    address: DEFAULT_ADDRESS,
});

type DistributionMethodQcdProps = {
    isFormStateReadOnly: boolean;
    formProgram: FormProgram;
    setFormProgram: Dispatch<SetStateAction<FormProgram>>;
};

const DistributionMethodQcd = ({ isFormStateReadOnly, formProgram, setFormProgram }: DistributionMethodQcdProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.distributionMethod' });

    const handleAddPayment = () => {
        const newQcd = initialQcdPaymentValue();
        const updatedQcd = formProgram?.qcd ? [...formProgram.qcd, newQcd] : [];
        setFormProgram(prev => ({ ...prev, qcd: updatedQcd as QCD[] }));
    };

    const handleDeleteQcd = (indexToDelete: number) => {
        setFormProgram(prev => ({ ...prev, qcd: prev.qcd?.filter((_, index: number) => index !== indexToDelete) }));
    };

    const handleFieldChange = (field: string, value: string | number, index: number) => {
        setFormProgram(prev => ({
            ...prev,
            qcd: prev.qcd?.map((qcdItem: QCD, i: number) => (i === index ? { ...qcdItem, [field]: value } : qcdItem)),
        }));
    };

    const renderPaymentDetails = formProgram?.qcd?.map((qcd: QCD, index: number) => (
        <div className="grid grid-cols-1 my-2" key={index}>
            <QcdPaymentDetails
                qcdDetails={qcd}
                isFormStateReadOnly={isFormStateReadOnly}
                id={index}
                onDeleteQcd={handleDeleteQcd}
                onDataChange={handleFieldChange}
            />
        </div>
    ));

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <Typography variant={TypographyVariant.H3}>{t('distributionMethod')}</Typography>
            <label htmlFor="paymentMethod" className="flex label my-2">
                {t(`paymentMethod`) as string}
            </label>
            <div className="grid grid-cols-3">
                <Field
                    className="max-w-lg mb-5"
                    onChange={() => {}}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={'QCD'}
                    data-testid="paymentMethod"
                    variant={FieldVariant.Inactive}
                />
            </div>
            {renderPaymentDetails}
            <Button
                onClick={handleAddPayment}
                size={ButtonSize.Small}
                type={ButtonType.Primary}
                className="my-4"
                variant={isFormStateReadOnly ? ButtonVariant.Inactive : ButtonVariant.Default}
            >
                {t('qcd.addPayment')}
            </Button>
            <div className="mt-4"></div>
        </CardContainer>
    );
};

export default DistributionMethodQcd;
