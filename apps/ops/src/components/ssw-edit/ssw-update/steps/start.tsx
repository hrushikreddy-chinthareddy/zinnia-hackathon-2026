import { useTranslation } from 'next-i18next';
import { useContext, useState } from 'react';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import StartStep, {
    StartStepSetState,
} from '@deps/components/workflows/start-step/start-step';
import { TranslationFiles } from '@deps/config/translations';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { Processes } from '@deps/models/case/case';

const INITIAL_FORM_DATA: any = {
    caseId: undefined,
    businessKey: undefined,
    isPrimaryBeneInfoOnFile: false,
    isContingentBeneInfoOnFile: false,
};

type StartProps = {
    policy: any;
    parentPage?: ParentPage;
    isFormStateReadOnly?: boolean;
};

const Start = ({
    policy,
    parentPage = ParentPage.CreateCase,
    isFormStateReadOnly = false,
}: StartProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'sswUpdate.tabs.start',
    });
    const { initialForm } = useContext(FormDataContext);
    const [formData, setFormData] = useState(() => ({
        ...INITIAL_FORM_DATA,
        ...(initialForm?.caseId ? { caseId: initialForm.caseId } : {}),
    }));

    return (
        <>
            <StartStep
                parentPage={parentPage}
                policy={policy}
                setState={setFormData as StartStepSetState}
                state={formData}
                title={t('title')}
                subtitle={isFormStateReadOnly ? '' : (t('subTitle') as string)}
                processType={Processes.SSW}
                isFormStateReadOnly={isFormStateReadOnly}
            />
        </>
    );
};

export default Start;
