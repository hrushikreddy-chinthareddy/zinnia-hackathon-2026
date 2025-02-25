import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { Party } from '@deps/models/case/withdrawal/case';

interface SingleLifePersonDetailsProps {
    personDetails: Party;
}

const SingleLifePersonDetails = ({ personDetails }: SingleLifePersonDetailsProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const [isSelected, setIsSelected] = useState(false);

    const { setFormProgram } = useContext(FormDataContext);

    const classes = clsx(
        'default-focus-within flex cursor-pointer flex-col gap-2 rounded border-2 border-gray-100 bg-white p-4 hover:border-accent1',
        {
            'border-primary': isSelected,
        }
    );

    useEffect(() => {
        if (isSelected) {
            setFormProgram(oldVal => {
                return {
                    ...oldVal,
                    coveredPersonInfo: {
                        firstName: personDetails.firstName,
                        lastName: personDetails.lastName,
                        middleName: personDetails.middleName,
                        partyId: personDetails.taxId,
                    },
                };
            });
        } else {
            setFormProgram(oldVal => {
                return {
                    ...oldVal,
                    coveredPersonInfo: null,
                };
            });
        }
    }, [isSelected]);

    return (
        <>
            <div className="my-3">
                <label className="font-primary text-md font-bold">{t('sswProgram.singleLifeTimeIncome.title')}</label>
            </div>
            <div className="grid grid-cols-6 gap-2">
                <label className={classes} data-testid={personDetails.taxId}>
                    <input
                        id={personDetails.taxId}
                        checked={isSelected}
                        className="sr-only"
                        name="case-documents"
                        type="radio"
                        onClick={() => {
                            setIsSelected(!isSelected);
                        }}
                    />

                    <Typography variant={TypographyVariant.BodyBold}>
                        {`${personDetails.firstName} ${personDetails.middleName} ${personDetails.lastName} `}
                    </Typography>
                </label>
            </div>
        </>
    );
};

export default SingleLifePersonDetails;
