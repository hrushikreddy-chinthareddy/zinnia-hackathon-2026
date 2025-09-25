import { LineOfBusiness } from '@xd/api-types/dist/generated-types/bpm';
import { Suspense } from 'react';

import { DocumentsView } from '@/app/(authenticated)/coverage/shared-views/documents-view/DocumentsView';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { LargeSkeleCard } from '@/components/skeleton-loader/policy-page/policy-page-skeletons';
import { getFeatureFlags } from '@/services/feature-flags';
import { DocumentCategory } from '@/types/document';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import styles from './SurrenderedPolicy.module.css';

export const SurrenderedPolicy = async ({
  planCode,
  policyNumber,
  activeDocumentsTab,
}: {
  planCode: string;
  policyNumber: string;
  activeDocumentsTab: DocumentCategory;
}) => {
  const flags = await getFeatureFlags();
  const isSurrenderEnabled = flags?.[FEATURE_FLAGS.TRANSACTION_FULL_SURRENDER];

  // @TODO: delete this once feature flag is enabled for all carriers/envs and removed
  if (!isSurrenderEnabled) {
    return (
      <>
        <div className="card">
          <p className="typography-content-body-bold">
            Your policy with us has ended.
          </p>
          <p className="typography-content-body my-lg">
            This policy was surrendered due to insufficient funds or because you
            withdrew the full account value.
          </p>
        </div>
        <CallForAssistance customInstruction="with surrender questions." />
      </>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.description}>
        <p>
          <b>Your policy with us has ended.</b>&nbsp;This policy was surrendered
          when you withdrew the full account value.
        </p>
        <p className="typography-content-body-sm-bold">
          Call <CarrierPhoneNumber /> to apply for reinstatement.
        </p>
      </div>
      <div>
        <h2 style={{ marginBottom: 'var(--space-md)' }}>Documents</h2>
        <Suspense fallback={<LargeSkeleCard />}>
          <DocumentsView
            planCode={planCode}
            policyNumber={policyNumber}
            lineOfBusiness={LineOfBusiness.LIFE}
            currentView={activeDocumentsTab}
          />
        </Suspense>
      </div>
    </div>
  );
};
