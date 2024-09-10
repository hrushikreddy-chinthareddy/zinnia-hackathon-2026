import { useTranslation } from 'next-i18next';
import { useContext, useState, useEffect } from 'react';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';

import ButtonGroup from '../button-group/button-group';

enum CslnValididated {
    Valid = 'valid',
    NotValid = 'notValid',
    Unselected = 'unselected',
}

export const convertToValue = (ack: CslnValididated): boolean | null => {
    if (ack === CslnValididated.Valid) {
        return true;
    }
    if (ack === CslnValididated.NotValid) {
        return false;
    }

    return null;
};

export const convertFromValue = (val: any): CslnValididated => {
    if (val === true) {
        return CslnValididated.Valid;
    }
    if (val === false) {
        return CslnValididated.NotValid;
    }

    return CslnValididated.Unselected;
};

interface CslnCheckProps {
    isFormStateReadOnly?: boolean,
}

export default function CslnCheck({ isFormStateReadOnly }: CslnCheckProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.cslnCheck' });
    const { formSignature, setFormSignature } = useContext(FormDataContext);
    const [isCslnCheck, setIsCslnCheck] = useState(convertFromValue(formSignature?.isCheckCSNLValid));

    useEffect(() => {
        setFormSignature({ ...formSignature, isCheckCSNLValid: convertToValue(isCslnCheck) });
    }, [isCslnCheck]);

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <Typography variant={TypographyVariant.H3} className="mb-4" data-testid="data-testid-csln-title">
                {t('title')}
            </Typography>
            <div className="flex flex-wrap gap-8 max-md:flex-col">
                <div className="flex-1">
                    <ButtonGroup
                        activeValue={isCslnCheck as CslnValididated}
                        toggle={value => setIsCslnCheck(value as CslnValididated)}
                        labels={[
                            {
                                label: t('valid'),
                                value: CslnValididated.Valid,
                            },
                            {
                                label: t('notValid'),
                                value: CslnValididated.NotValid,
                            },
                        ]}
                        size={'xxs'}
                        variant={'primary'}
                        groupLabel={t('label')}
                        disabled={isFormStateReadOnly}
                    />
                </div>
            </div>
        </CardContainer>
    );
}
