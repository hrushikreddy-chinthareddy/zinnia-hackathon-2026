import { useTranslation } from 'next-i18next';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import StartStep, { StartStepSetState } from '@deps/components/workflows/start-step/start-step';
import { TranslationFiles } from '@deps/config/translations';
import { Processes } from '@deps/models/case/case';
import { Policy } from '@deps/models/policy/sor-policy';

import { useBeneChange } from '../../../bene-change-provider';

interface DocSelectionStepProps {
    policy: Policy;
}

const DocSelectionStep = ({ policy }: DocSelectionStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'beneChange' });
    const { formData, setFormData } = useBeneChange();
    return (
        <>
            <StartStep
                parentPage={ParentPage.CreateCase}
                policy={policy}
                setState={setFormData as StartStepSetState}
                state={formData}
                title={t('start.title')}
                subtitle={t('start.subtitle')}
                processType={Processes.BeneficiaryChange}
            />
        </>
    );
};

export default DocSelectionStep;
