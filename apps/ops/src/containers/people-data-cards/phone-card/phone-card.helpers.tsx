import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { v4 as uuid4 } from 'uuid';

import IconButton from '@deps/components/icon-button/icon-button';
import Label, { LabelVariant } from '@deps/components/label/label';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import PendingTag from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/pending-tag';
import { PhoneWithPending } from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/types';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { SideSheetPeopleHeaderProps } from '@deps/containers/people-data-cards/side-sheet-people-header/side-sheet-people-header';
import { isEndDated } from '@deps/helpers/date.helpers';
import { formatPhone } from '@deps/helpers/string.helpers';
import {
    NonFinancialTransactionActions,
    NonFinancialTransactions,
} from '@deps/queries/api/bpm-non-financial';
import { ReactComponent as EditIcon } from '@deps/styles/elements/icons/icons_outlined/edit-alt.svg';
import { Phone, PhoneType } from '@zinnia/api-types/types/sor';

interface FormattedPhoneProps {
    phone: Phone;
}

interface PhoneProps {
    editable?: boolean;
    onEditClick: (params: {
        phone: Phone;
        header: SideSheetPeopleHeaderProps;
    }) => void;
    phones: Phone[];
    showAdditional: boolean;
}

export interface SortPhonesByType {
    phones?: Phone[];
}

export const sortPhonesByType = ({ phones }: SortPhonesByType): Phone[] => {
    if (!phones) return [];

    const validPhones =
        phones?.filter(
            (phone) => phone.dialNumber !== null && !isEndDated(phone.endDate)
        ) ?? [];

    const businessPhones: Phone[] = [];
    const faxes: Phone[] = [];
    const homePhones: Phone[] = [];
    const mobilePhones: Phone[] = [];
    const otherPhones: Phone[] = [];
    const unknownPhones: Phone[] = [];

    validPhones.forEach((validPhone) => {
        switch (validPhone.phoneType) {
            case PhoneType.BUSINESS:
                businessPhones.push(validPhone);
                break;
            case PhoneType.FAX:
                faxes.push(validPhone);
                break;
            case PhoneType.HOME:
                homePhones.push(validPhone);
                break;
            case PhoneType.MOBILE:
                mobilePhones.push(validPhone);
                break;
            case PhoneType.OTHER:
                otherPhones.push(validPhone);
                break;
            default:
                unknownPhones.push(validPhone);
                break;
        }
    });

    return [
        ...businessPhones,
        ...faxes,
        ...homePhones,
        ...mobilePhones,
        ...otherPhones,
        ...unknownPhones,
    ];
};

export const FormattedPhone = ({ phone }: FormattedPhoneProps) => {
    const { t } = useTranslation();

    const { bestTime } = phone;

    return (
        <>
            <Typography className="truncate" variant={TypographyVariant.BodySm}>
                <PiiWrapper>{formatPhone(phone)}</PiiWrapper>
            </Typography>
            {bestTime && (
                <Typography
                    className="truncate"
                    variant={TypographyVariant.BodySm}
                >
                    <PiiWrapper>
                        {t('people.card.phone.general.call', {
                            bestTime: bestTime,
                        })}
                    </PiiWrapper>
                </Typography>
            )}
        </>
    );
};

export const Phones = ({
    editable,
    onEditClick,
    phones,
    showAdditional,
}: PhoneProps) => {
    const { t } = useTranslation();

    if (!phones.length) return null;

    return (
        <>
            {phones.map((phone, index) => {
                const { phoneType = PhoneType.HOME, isPending } =
                    phone as PhoneWithPending;
                const phoneTypeKey = phoneType
                    ? phoneType.toLocaleLowerCase()
                    : 'homePhone';
                const labelId = uuid4();

                return (
                    <div
                        className={clsx('flex flex-col items-start', {
                            hidden: !showAdditional && index > 3,
                        })}
                        key={`${index}-${phone.dialNumber}`}
                    >
                        <div className="flex items-center gap-1">
                            <Label
                                id={`${labelId}-people-phone-card`}
                                label={t(
                                    `people.card.phone.phoneOptions.${phoneTypeKey}`
                                )}
                                variant={LabelVariant.FieldLabel}
                            />
                            {isPending && <PendingTag />}
                            {editable && !isPending && (
                                <IconButton
                                    aria-describedby={`${labelId}-people-phone-card`}
                                    onClick={() =>
                                        onEditClick({
                                            phone,
                                            header: {
                                                action: NonFinancialTransactionActions.Edit,
                                                transaction:
                                                    NonFinancialTransactions.Number,
                                                typeTranslation: t(
                                                    `people.card.phone.phoneOptions.${phoneTypeKey}`
                                                ) as string,
                                            },
                                        })
                                    }
                                >
                                    <EditIcon height={16} width={16} />
                                    <span className="sr-only">
                                        {t('people.card.general.edit')}
                                    </span>
                                </IconButton>
                            )}
                        </div>
                        <FormattedPhone phone={phone} />
                    </div>
                );
            })}
        </>
    );
};
