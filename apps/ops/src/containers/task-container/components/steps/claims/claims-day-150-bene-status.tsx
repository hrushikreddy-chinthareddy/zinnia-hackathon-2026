/* eslint-disable import/no-unresolved */
import { Label, Radio } from '@zinnia/bloom/components';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { TaskDataContext } from '@deps/containers/task-container/task-context';
import { updateTask } from '@deps/containers/task-container/task.helpers';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

import BeneficiaryDeceased from './beneficiary-deceased';
import { UpdatedBeneficiaryRecord } from './claims.type';

type TaskReviewStepProps = {
  beneficiary: UpdatedBeneficiaryRecord;
  setBeneficiary: React.Dispatch<React.SetStateAction<UpdatedBeneficiaryRecord>>;
};

export const ClaimBeneStatus = ({ beneficiary, setBeneficiary }: TaskReviewStepProps) => {

  const { task, setTask, correlationId, setSubmitFailed, formErrors, setFormErrors } = useContext(TaskDataContext);
  const { goToNext, setCurrentStepIndex } = useWorkflow();
  const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'claimsDay150.beneStatus' });
  const [isBeneDeceased, setIsBeneDeceased] = useState<string>('');

  const handleContinueFn = async () => {
    if (isBeneDeceased === 'yes') {

      const success = await updateTask(task, correlationId);
      setSubmitFailed && setSubmitFailed(!success);
      setCurrentStepIndex(3)

    } else {
      goToNext();
    }


  };
  const validateAddress = () => {
    const errors: FormValidationErrors = {};
    if (!isBeneDeceased) {
      errors['beneDeceased'] = "Missing contactRole or phone or name or changeType ";
    }

    if ((!beneficiary.beneDeceased && !beneficiary.beneDeathSourceOfInfo) && isBeneDeceased === 'yes') {
      errors['beneDeceased'] = "Missing contactRole or phone or name or changeType ";
    }
    setFormErrors(errors);
  };

  useEffect(() => {
    const updatedTask = { ...task };

    // Initialize the nested objects if they don't exist
    if (!updatedTask.data) updatedTask.data = {};
    if (!updatedTask.data.details) updatedTask.data.details = {};
    if (!updatedTask.data.details.benefinalcontactattempt)
      updatedTask.data.details.benefinalcontactattempt = {};

    updatedTask.data.details.benefinalcontactattempt.beneficiaryChangeDetail = {
      ...(updatedTask.data.details.benefinalcontactattempt?.beneficiaryChangeDetail || {}),
      ...beneficiary,
      beneDeceased: isBeneDeceased === 'yes',
      changeType: isBeneDeceased === 'yes' ? "BENEFICIARY_DECEASED" : null,
      changeRequire: isBeneDeceased === 'yes' ? true : false
    };

    setTask(updatedTask);
    validateAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBeneDeceased, beneficiary])

  return (
    <WorkflowCard
      title={t('title')}
      subtitle={t('subTitle') as string}
      footerContent={
        <TransactionNavigationButtons
          className="mt-4"
          handleContinue={handleContinueFn}
          isSubmit={false}
          disableContinue={Object.keys(formErrors).length > 0}
          parentPage={ParentPage.CreateCase}
          leaveTransactionLink="/create-case"
          cancelLabel={t('cancel') as string}
        />
      }
    >
      <div className="flex flex-col gap-4">
        <Typography variant={TypographyVariant.H3}>{t('title') as string}</Typography>

        <div>
          <Label labelFor="beneStatus">{t('isDeceased') as string}</Label>
          <div className='py-2'>
            <Radio
              id="beneStatus"
              value={isBeneDeceased}
              onValueChange={(value) => {
                setIsBeneDeceased(value);
                setTask({
                  ...task, data: {
                    ...task.data, details: {
                      ...task.data.details, benefinalcontactattempt: {
                        ...task.data.details.benefinalcontactattempt,
                        subTaskBeneDeceasedChangeRequire: value == "yes" ? true : false
                      }
                    }
                  }
                })
              }}
              options={
                [
                  { label: t('yes') as string, value: 'yes', ariaLabel: t('yes') as string },
                  { label: t('no') as string, value: 'no', ariaLabel: t('no') as string },
                ]} />
          </div>
        </div>

        {
          isBeneDeceased === 'yes' &&
          <div className="grid grid-cols-4">
            <div className="col-span-1">
              <BeneficiaryDeceased beneficiary={beneficiary} setBeneficiary={setBeneficiary} t={t} />
            </div>
          </div>
        }
      </div>
    </WorkflowCard>
  );
};
