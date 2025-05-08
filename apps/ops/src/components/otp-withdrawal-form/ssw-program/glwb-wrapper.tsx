import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import { FieldSize } from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { PartyRoles, SSWType } from '@deps/models/case/withdrawal/case';

import GuaranteedWithdrawalBenefits from './guaranteed-life-time-withdrawal-benefits';
import { GlwbType, glwbTypeOptions } from './ssw-form-program.helpers';
import { SSWProgram } from './ssw-row';

interface GlWbWrapperProps {
    sswData: SSWProgram;
}

const GlWbWrapper = ({ sswData }: GlWbWrapperProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.sswProgram' });
    const { formParty, setFormParty, formProgram, setFormProgram } = useContext(FormDataContext);

    const [glwbType, setGlwbType] = useState(formProgram?.glwbType?.text || GlwbType.Dynamic);

    const applicablePartyRoles = [PartyRoles.GLWB_FIRST_COVERED_PERSON, PartyRoles.GLWB_SEC_COVERED_PERSON];
    const showCoverPerson = [SSWType.SingleLifetimeIncomeOption, SSWType.JointLifetimeIncomeOption].includes(
        sswData?.programSubType.text as SSWType
    );

    useEffect(() => {
        if (showCoverPerson) {
            setFormProgram(fs => ({
                ...fs,
                glwbType: { text: glwbType },
            }));
        }
    }, [glwbType, sswData]);

    return (
        <>
            {showCoverPerson && (
                <div>
                    <div className="grid grid-cols-5 gap-2 my-4">
                        <SelectSimple
                            className="max-w-lg my-3"
                            label={t('glwbTypeLabel') as string}
                            options={glwbTypeOptions(t)}
                            onChange={val => setGlwbType(val)}
                            size={FieldSize.Small}
                            value={glwbType}
                            name="glwb-type"
                        />
                    </div>
                    {formParty.parties.map(
                        item =>
                            applicablePartyRoles.includes(item.partyRoleType) && (
                                <>
                                    <GuaranteedWithdrawalBenefits
                                        glwbDetails={item}
                                        setFormParty={setFormParty}
                                        isFormStateReadOnly={false}
                                        key={item.partyRoleType}
                                    />
                                </>
                            )
                    )}
                </div>
            )}
        </>
    );
};

export default GlWbWrapper;
