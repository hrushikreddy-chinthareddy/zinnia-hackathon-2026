import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useCallback, useContext } from 'react';

import TransactionNavigationButtons, { ParentPage } from "@deps/components/transaction-navigation-buttons/transaction-navigation-buttons";
import WorkflowCard from "@deps/components/workflows/workflow-card/workflow-card";
import { TranslationFiles } from '@deps/config/translations';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { FormValidationErrors, NigoMessages } from '@deps/models/case/withdrawal/case';

import { NigoDetails } from './nigo-details';
import { useNigoEntry } from '../../nigo-entry-provider';


interface NigoDetailsStepProps {
    nigoExceptions: any;
    nigoSubExceptions: any;
};

export const  NigoDetailsStep = ({nigoExceptions, nigoSubExceptions} : NigoDetailsStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'nigoEntry.nigoDetails' });
    const { goToNext } = useWorkflow();
    const { exceptions, messages, formErrors, setFormErrors } = useNigoEntry();    
    const { setFormNigos } = useContext(FormDataContext);

    const handleStepContinue = useCallback(() => {
        const errors = {} as FormValidationErrors;
        if (exceptions.length === 0) {
            errors['noCategorySelected'] = t('formErrors.formValidation.noCategorySelected');
            setFormErrors(errors);
        }

        if (exceptions.length > 0) {
            exceptions.forEach((exception: string) => {
                if ( messages[exception] === undefined) {
                    errors['noCategoryDetailsSelected'] = t('formErrors.formValidation.noCategoryDetailsSelected');
                }
            });
            setFormErrors(errors);
        }

        if (Object.keys(errors).length === 0) {
            const nigos: NigoMessages[] = [];
            exceptions.forEach((exception) => {
                const obj = {
                    exceptionId: exception,
                    messages: Object.keys(messages[exception])
                };
                nigos.push(obj);
            });
            setFormNigos({ nigos: nigos } );
                
            goToNext();
        }
        
    }, [exceptions, goToNext, messages, setFormErrors, setFormNigos, t]);

    return (
        <WorkflowCard
            title={t('title')}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-4"
                    handleContinue={handleStepContinue}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink='/create-case'
                />
            }
        >
            <div className="flex flex-col gap-5">
               <NigoDetails nigoExceptions={nigoExceptions} nigoSubExceptions={nigoSubExceptions} />
               {formErrors?.noCategorySelected && <AssistiveText text={formErrors?.noCategorySelected} variant={AssistiveTextVariant.Error} className="my-4" />}
               {formErrors?.noCategoryDetailsSelected && <AssistiveText text={formErrors?.noCategoryDetailsSelected} variant={AssistiveTextVariant.Error} className="my-4" />}
            </div>
        </WorkflowCard>
    );
};

