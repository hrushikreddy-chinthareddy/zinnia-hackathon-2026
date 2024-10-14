import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';
import xss from 'xss';

import { RenewalFormDataContext } from '@deps/contexts/OtpRenewalFormContext';
import { TargetFundAllocation } from '@deps/models/case/task';

import FieldLabel from '../fields/field-label';
import Radio, { RadioItem, RadioOrientation, RadioVariant } from '../radio/radio';
import Typography, { TypographyVariant } from '../typography/typography';
interface RenewalPeriodSingleSectionProps {
    options: RadioItem[];
    isFormStateReadOnly: boolean;
}
export default function RenewalPeriodSingleSection({ options, isFormStateReadOnly }: RenewalPeriodSingleSectionProps) {
    const { setSubsequentTargetFunds, formErrors } = useContext(RenewalFormDataContext);
    const { t } = useTranslation(undefined, { keyPrefix: 'caseRenewal.request' });
    
    const [fundAllocations, setFundAllocations] = useState<TargetFundAllocation[]>([]);

    const setFundAllocation = (fundName: string, value: string) => {
        setFundAllocations([{ fundName, value }]);
    };

    useEffect(() => {
        setSubsequentTargetFunds(fundAllocations);
    }, [fundAllocations]);

    return (
        <>
            <Typography variant={TypographyVariant.H3} className="mb-2 flex flex-wrap gap-5">
                {t(`period`)}
            </Typography>
            <div className="flex">
                <FieldLabel classNames="mr-2" label={t('pleaseCheck') as string} />
                <div className={formErrors?.period ? 'border-2 border-solid border-semantic-error p-2' : 'p2'}>
                    <Radio
                        items={options}
                        onChange={(e: any) => {
                            setFundAllocation(xss(e?.target?.value), '100');
                        }}
                        orientation={RadioOrientation.Horizontal}
                        value={fundAllocations?.[0]?.fundName || ''}
                        variant={isFormStateReadOnly ? RadioVariant.Inactive : RadioVariant.Default}
                        disabled={isFormStateReadOnly}
                    />
                </div>
            </div>
        </>
    );
}
