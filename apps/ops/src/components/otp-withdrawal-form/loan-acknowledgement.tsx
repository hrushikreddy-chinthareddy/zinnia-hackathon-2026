import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';

interface LoanAcknowledgementProps {
    isFormStateReadOnly?: boolean;
    isLoanRepayment?: boolean;
}

export default function LoanAcknowledgement({
    isFormStateReadOnly,
    isLoanRepayment = false,
}: LoanAcknowledgementProps) {
    const { formLoan, setFormLoan } = useContext(FormDataContext);
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request',
    });
    const [acknowledgement, setAcknowledgement] = useState(
        formLoan?.isLoanAck?.text || false
    );

    useEffect(() => {
        setFormLoan({
            isLoanAck: {
                text: acknowledgement,
            },
        });
    }, [acknowledgement]);

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <Typography variant={TypographyVariant.H3} className="mb-4">
                {isLoanRepayment
                    ? t('loanRepayment.title')
                    : t('loanAcknowledgement.title')}
            </Typography>
            <div className="flex flex-wrap gap-8 max-md:flex-col">
                <div className="flex-1">
                    <CheckboxText
                        data-testid="acknowledgement"
                        label={
                            isLoanRepayment
                                ? t('loanRepayment.acknowledgement')
                                : t('loanAcknowledgement.acknowledgement')
                        }
                        checked={acknowledgement}
                        onChange={() => setAcknowledgement(!acknowledgement)}
                        isDisabled={isFormStateReadOnly}
                    />
                </div>
            </div>
        </CardContainer>
    );
}
