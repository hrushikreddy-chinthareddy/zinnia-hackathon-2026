import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import StartStep, {
    StartStepSetState,
} from '@deps/components/workflows/start-step/start-step';
import { TranslationFiles } from '@deps/config/translations';
import { Processes } from '@deps/models/case/case';

const INITIAL_FORM_DATA: any = {
    caseId: undefined,
    businessKey: undefined,
    isPrimaryBeneInfoOnFile: false,
    isContingentBeneInfoOnFile: false,
};

const Start = ({ policy }: any) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'sswUpdate.tabs.start',
    });
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);

    return (
        <>
            <StartStep
                parentPage={ParentPage.CreateCase}
                policy={policy}
                setState={setFormData as StartStepSetState}
                state={formData}
                title={t('title')}
                subtitle={t('subTitle') as string}
                processType={Processes.SSW}
            />
        </>
    );
};

export default Start;
