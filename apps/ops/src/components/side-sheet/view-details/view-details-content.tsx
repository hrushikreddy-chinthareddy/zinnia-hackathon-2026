import { useTranslation } from 'next-i18next';

import ViewDetailCard from '@deps/components/card/view-detail-card/view-detail-card';
import { TranslationFiles } from '@deps/config/translations';

interface ViewDetailsContentProps {
    qualificationType: string;
    contractValue: string;
    policyDate: string;
    issueState: string;
}

export function ViewDetailsContent({ qualificationType, contractValue, policyDate, issueState }: ViewDetailsContentProps) {
    const { t } = useTranslation(TranslationFiles.COMMON);
    return (
        <div className="flex h-full flex-col">
            <div className="overflow-y-scroll pt-4 gap-4  ">
                {qualificationType && (
                    <ViewDetailCard cardTitle={t('site.navLinks.viewDetails.qualificationType')} cardValue={qualificationType} />
                )}
                {contractValue && (
                    <ViewDetailCard cardTitle={t('site.navLinks.viewDetails.contractValue')} cardValue={`$ ${contractValue}`} />
                )}
                {policyDate && <ViewDetailCard cardTitle={t('site.navLinks.viewDetails.policyDate')} cardValue={policyDate} />}
                {issueState && <ViewDetailCard cardTitle={t('site.navLinks.viewDetails.issueState')} cardValue={issueState} />}
            </div>
            <div className="grow" />
        </div>
    );
}
