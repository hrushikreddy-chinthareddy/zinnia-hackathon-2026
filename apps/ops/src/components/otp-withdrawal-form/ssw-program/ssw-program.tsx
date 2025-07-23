import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useContext, useState, useEffect } from 'react';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import { RadioItem } from '@deps/components/radio/radio';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import JointCoveredPersonDetails from '@deps/containers/otp/ssw-forms/sbgc/joint-covered-person-details';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import {
    AmountType,
    SSWType,
    Frequency,
    PartyRoles,
    Party,
    FormParty,
} from '@deps/models/case/withdrawal/case';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import GlWbWrapper from './glwb-wrapper';
import SingleLifePersonDetails from './single-life-person-details';
import {
    getCoveredLifeInitialValues,
    SSWFormProgramFields,
} from './ssw-form-program.helpers';
import SystematicWithdrawalRow, { SSWProgram } from './ssw-row';
import ExistingPrograms from '../rmd-method/existing-programs';

type SystematicWithdrawalProgramProps = {
    title?: string;
    options: SSWProgramOptions[];
    isReadOnly?: boolean;
    planCode?: string;
    jointCoveredPlanCodes?: string[];
    onSswProgramFrequencyChange?: (val: Frequency) => void;
    singleLifePersonApplicable?: boolean;
    jointCoveredPersonApplicable?: boolean;
    glwbApplicable?: boolean;
    isLC?: boolean;
};

export interface SSWProgramOptions extends Omit<RadioItem, 'subelement'> {
    generateSSWPayloadFromSelection: (
        sswData: SSWProgram
    ) => SSWFormProgramFields; // Defines what the formProgram "editable fields" should look like when the option is selected.  There is significant variance between carriers and selections on what parts of formProgram should change.
}

const SystematicWithdrawalProgram = ({
    options,
    title,
    isReadOnly,
    onSswProgramFrequencyChange,
    planCode,
    jointCoveredPlanCodes,
    singleLifePersonApplicable = false,
    jointCoveredPersonApplicable = true,
    glwbApplicable = false,
    isLC = true,
}: SystematicWithdrawalProgramProps) => {
    const { formErrors, formProgram, formParty, setFormProgram, setFormParty } =
        useContext(FormDataContext);
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.sswProgram',
    });
    const today = dayjs().format(ZAHARA_API_DATE_FORMAT);

    const jointOwnerDetails = formParty?.parties?.find(
        (item) => item.partyRoleType === PartyRoles.JOINT_OWNER
    );
    const hasCoveredLifePerson = !!formParty?.parties?.find(
        (item) =>
            item.partyRoleType === PartyRoles.GLWB_FIRST_COVERED_PERSON ||
            item.partyRoleType === PartyRoles.GLWB_SEC_COVERED_PERSON
    );

    const [sswData, setSswData] = useState<SSWProgram>({
        startDate: {
            text: formProgram?.programFrequency?.beginDate.text || today,
        },
        programSubType: { text: formProgram?.programSubType.text as SSWType },
        frequency: {
            text:
                formProgram?.programFrequency?.frequency?.text ||
                Frequency.Annually,
        },
        duration: {
            text: formProgram?.programFrequency?.duration?.text || null,
        },
        amount: {
            text: formProgram?.programAmount?.text || null,
            amountType: AmountType.Dollar,
        },
        percent: {
            text: formProgram?.partialPercent?.text || null,
            amountType: AmountType.Percent,
        },
        depleteFundYears: {
            text: formProgram?.programFrequency?.fixedPeriodYear?.text || null,
        },
    });

    useEffect(() => {
        const selectedOption = options.find(
            (val) => val.value === sswData.programSubType.text
        );

        if (selectedOption?.generateSSWPayloadFromSelection) {
            setFormProgram((oldVal) => {
                return {
                    ...oldVal,
                    ...selectedOption.generateSSWPayloadFromSelection(sswData),
                };
            });
        }
        if (
            glwbApplicable &&
            !hasCoveredLifePerson &&
            (sswData.programSubType.text ===
                SSWType.SingleLifetimeIncomeOption ||
                sswData.programSubType.text ===
                    SSWType.JointLifetimeIncomeOption)
        ) {
            setFormParty((prev: FormParty) => {
                const coveredLifeInitialValues =
                    getCoveredLifeInitialValues() as any;
                return {
                    parties: [...prev.parties, ...coveredLifeInitialValues],
                };
            });
        }

        onSswProgramFrequencyChange &&
            onSswProgramFrequencyChange(sswData.frequency.text);
    }, [sswData, setFormProgram]);

    return (
        <CardContainer containerClassNames={'border-b-2 border-gray-100'}>
            <Typography variant={TypographyVariant.H3} className="my-2">
                {title || t('title')}
            </Typography>
            <ExistingPrograms disableAllPrograms={true} isLC={isLC} />
            <Typography variant={TypographyVariant.BodyBold} className="my-2">
                {t('newProgram')}
            </Typography>
            <div className="p-2" data-testid="systematic-withdrawal-program">
                <SystematicWithdrawalRow
                    isReadOnly={isReadOnly}
                    sswTypeOptions={options}
                    onDataChange={setSswData}
                    sswData={sswData}
                />
            </div>
            {!glwbApplicable &&
                jointCoveredPersonApplicable &&
                sswData.programSubType.text ===
                    SSWType.JointLifetimeIncomeOption && (
                    <JointCoveredPersonDetails
                        isReadOnly={isReadOnly || false}
                        planCode={planCode}
                        jointCoveredPlanCodes={jointCoveredPlanCodes}
                    />
                )}

            {singleLifePersonApplicable &&
                sswData.programSubType.text ===
                    SSWType.SingleLifetimeIncomeOption && (
                    <SingleLifePersonDetails
                        personDetails={jointOwnerDetails as Party}
                    />
                )}

            {glwbApplicable && <GlWbWrapper sswData={sswData} />}

            {formErrors && (
                <div className="flex flex-col">
                    {formErrors?.systematicStartDate && (
                        <AssistiveText
                            text={formErrors?.systematicStartDate}
                            variant={AssistiveTextVariant.Error}
                            className="mt-2"
                        />
                    )}
                </div>
            )}
        </CardContainer>
    );
};

export default SystematicWithdrawalProgram;
