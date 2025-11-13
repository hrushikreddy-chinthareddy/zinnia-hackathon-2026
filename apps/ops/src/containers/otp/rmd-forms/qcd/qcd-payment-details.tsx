/* eslint-disable react/prop-types */
import { useTranslation } from 'next-i18next';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import IconButton from '@deps/components/icon-button/icon-button';
import AddressEntry, {
    DEFAULT_ADDRESS,
} from '@deps/components/otp-withdrawal-form/address-entry';
import { QCD } from '@deps/models/case/withdrawal/case';
import { ReactComponent as RemoveIcon } from '@deps/styles/elements/icons/icons_outlined/trash.svg';

import { amountFormat } from '../../reg60-forms/utils/reg60-constants';

interface QcdPaymentDetailsProps {
    qcdDetails: QCD;
    isFormStateReadOnly: boolean;
    id: number;
    onDeleteQcd: (id: number) => void;
    onDataChange: (field: string, value: any, id: number) => void;
}

const QcdPaymentDetails: React.FC<QcdPaymentDetailsProps> = ({
    qcdDetails,
    isFormStateReadOnly,
    id,
    onDeleteQcd,
    onDataChange,
}) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.distributionMethod',
    });
    return (
        <div className="flex">
            <div>
                <Field
                    className="my-2"
                    label={t('qcd.charityName') as string}
                    onChange={(e) =>
                        onDataChange('charityName', e.target.value, id)
                    }
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={qcdDetails.charityName}
                    data-testid="paymentMethod"
                    variant={
                        isFormStateReadOnly
                            ? FieldVariant.Inactive
                            : FieldVariant.Default
                    }
                    maxLength={40}
                />
                <Field
                    className="w-54 my-2"
                    label={t('qcd.amount') as string}
                    onChange={(e) =>
                        onDataChange(
                            'amount',
                            { text: e.target.value, amountType: 'DOLLAR' },
                            id
                        )
                    }
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={qcdDetails.amount.text}
                    formatOptions={amountFormat}
                    leading={<div>$</div>}
                    data-testid="irsAmount"
                    variant={
                        isFormStateReadOnly
                            ? FieldVariant.Inactive
                            : FieldVariant.Default
                    }
                />
                <AddressEntry
                    onDataChange={(value) => onDataChange('address', value, id)}
                    initialAddress={qcdDetails.address ?? DEFAULT_ADDRESS}
                    className="my-2"
                    isFormStateReadOnly={isFormStateReadOnly}
                    isPayeeAddress={true}
                    isAddressLine2Required={true}
                />
            </div>
            <div>
                <IconButton
                    className=" mt-9 ml-20"
                    onClick={() => onDeleteQcd(id)}
                    aria-label={'removeThisRmdProgram' as string}
                    disabled={isFormStateReadOnly}
                >
                    <RemoveIcon height={25} width={25} />
                </IconButton>
            </div>
        </div>
    );
};

export default QcdPaymentDetails;
