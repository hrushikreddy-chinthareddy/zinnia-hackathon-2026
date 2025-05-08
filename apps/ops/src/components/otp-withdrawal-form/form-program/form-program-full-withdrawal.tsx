import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { AccountCloseReason, FormProgram, ProgramSubType, ProgramType, WithdrawalType } from '@deps/models/case/withdrawal/case';

import FormProgramProcessDate, { SelectOneOption } from './form-program-process-date';
import { getDefaultFormProgramValues } from './form-program.helpers';

const toggleOption = (val: string, setFormProgram: React.Dispatch<React.SetStateAction<FormProgram>>) => {
    return (shouldBeChecked: boolean): void => {
        setFormProgram(formProgram => {
            let accountCloseReasons = (formProgram?.accountCloseReason?.text || '').split(',').filter(Boolean);
            if (accountCloseReasons.indexOf(val) === -1 && shouldBeChecked) {
                accountCloseReasons.push(val);
            }
            if (!shouldBeChecked) {
                accountCloseReasons = accountCloseReasons.filter(reason => val !== reason.trim());
            }
            return {
                ...formProgram,
                accountCloseReason: {
                    text: accountCloseReasons.join(','),
                },
                ...(val == ProgramSubType.TotalFreeWithdrawal && {
                    accountCloseReason: { text: null },
                    programSubType: { text: shouldBeChecked ? ProgramSubType.TotalFreeWithdrawal : null },
                }),
            };
        });
    };
};
interface FormProgramFullWithdrawalProps {
    fullWithdrawalOptions?: Option<AccountCloseReason | ProgramSubType>[];
    selectOneOptions?: SelectOneOption[];
    isFormStateReadOnly?: boolean;
}

export default function FormProgramFullWithdrawal({
    selectOneOptions,
    isFormStateReadOnly,
    fullWithdrawalOptions,
}: FormProgramFullWithdrawalProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.amountDetails.fullWithdrawal' });

    const { setFormProgram } = useContext(FormDataContext);

    useEffect(() => {
        setFormProgram(({ accountCloseReason, isValidAsOfDate, asOfDate, ...rest }) => {
            // Resetting formProgram to ensure any partial selections are wiped.
            // ProgramType and withdrawType are constant for any selections made in this part of the form.
            // Retaining accountCloseReason, isValidAsOfDate, asOfDate, which are what this section modifies
            return {
                ...rest,
                ...getDefaultFormProgramValues(),
                accountCloseReason,
                asOfDate,
                isValidAsOfDate,
                programType: { text: ProgramType.FullSurrender },
                withdrawType: { text: WithdrawalType.Gross },
            };
        });
    }, []);

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <Typography variant={TypographyVariant.H3} className="mb-2">
                {t(`title`)}
            </Typography>

            {fullWithdrawalOptions && <FullWithdrawal isFormStateReadOnly={isFormStateReadOnly} options={fullWithdrawalOptions} />}
            {selectOneOptions && <FormProgramProcessDate isFormStateReadOnly={isFormStateReadOnly} options={selectOneOptions} />}
        </CardContainer>
    );
}

type FullWithdrawalProps = {
    options: Option<AccountCloseReason | ProgramSubType>[];
    isFormStateReadOnly?: boolean;
};

type Option<T> = {
    label: string;
    value: T;
};

export function FullWithdrawal({ options, isFormStateReadOnly }: FullWithdrawalProps) {
    const { formProgram, setFormProgram } = useContext(FormDataContext);

    const isChecked = (val: string): boolean => {
        return (formProgram?.accountCloseReason?.text || '')?.indexOf(val) > -1;
    };

    return (
        <div className="my-4 flex flex-col gap-4" data-testid="full-withdrawal-program">
            {options.map(({ label, value }) => (
                <div key={`full-withdrawal-chexbox-${value}`}>
                    <CheckboxText
                        checked={isChecked(value)}
                        label={label}
                        onChange={toggleOption(value, setFormProgram)}
                        data-testid={value}
                        isDisabled={isFormStateReadOnly}
                    />
                </div>
            ))}
        </div>
    );
}
