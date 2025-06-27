import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldDateSelect, {
    DATE_PICKER_FORMAT,
} from '@deps/components/fields/field-date-select/field-date-select';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { TaskStatus } from '@deps/models/case/task-instance';
import {
    CaseStatus,
    ProcessRequestType,
} from '@deps/models/case/withdrawal/case';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

const AsOfDateComponent = () => {
    const {
        formProgram,
        currentFormState,
        setFormProgram,
        featureFlagDecisions,
    } = useContext(FormDataContext);
    const searchParams = useSearchParams();

    const processRequestType =
        formProgram?.processRequestType?.[0]?.text || null;
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.amountDetails.processTimeframe',
    });
    const [asOfDate, setAsOfDate] = useState(
        formProgram?.asOfDate?.text &&
            dayjs(formProgram.asOfDate?.text, ZAHARA_API_DATE_FORMAT).isValid()
            ? dayjs(formProgram.asOfDate.text, ZAHARA_API_DATE_FORMAT).format(
                  DATE_PICKER_FORMAT
              )
            : ''
    );
    const shouldShowNewExperience =
        featureFlagDecisions?.[FEATURE_FLAGS.NEW_EXP];
    const isFormStateReadOnly = shouldShowNewExperience
        ? searchParams.get('action') === 'readonly' ||
          (currentFormState !== CaseStatus.Pending &&
              currentFormState !== TaskStatus.New &&
              currentFormState !== TaskStatus.InProgress &&
              searchParams.get('action') !== 'duplicate')
        : false;

    useEffect(() => {
        setFormProgram((ogFormProgran) => {
            return {
                ...ogFormProgran,
                asOfDate: {
                    text:
                        ogFormProgran?.isValidAsOfDate &&
                        ogFormProgran?.processRequestType?.[0]?.text ===
                            ProcessRequestType.AsOfDate &&
                        asOfDate
                            ? dayjs(asOfDate, DATE_PICKER_FORMAT).format(
                                  ZAHARA_API_DATE_FORMAT
                              )
                            : null,
                },
            };
        });
    }, [asOfDate, setFormProgram, processRequestType]);

    return (
        <div className={`-mt-4 flex flex-row items-center gap-2`}>
            <Content
                contentClassName="h-14 flex items-center"
                variant={ContentVariant.BodySm}
                details={t('asOfThisDate') as string}
            />
            {formProgram?.processRequestType?.[0]?.text ===
                ProcessRequestType.AsOfDate && (
                <FieldDateSelect
                    id="formProgramAsOfDatePicker"
                    isFutureDateDisabled={false}
                    onChange={(e) => {
                        setAsOfDate(e.target.value);
                    }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={asOfDate}
                    name="asOfDate"
                    disabled={isFormStateReadOnly}
                    variant={
                        isFormStateReadOnly
                            ? FieldVariant.Inactive
                            : FieldVariant.Default
                    }
                />
            )}
        </div>
    );
};

export default AsOfDateComponent;
