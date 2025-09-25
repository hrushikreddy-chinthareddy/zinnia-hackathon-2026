import { LineOfBusiness } from '@xd/api-types/dist/generated-types/sor';
import { Suspense } from 'react';

import { DocumentsView } from '@/app/(authenticated)/coverage/shared-views/documents-view/DocumentsView';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { LargeSkeleCard } from '@/components/skeleton-loader/policy-page/policy-page-skeletons';
import { getFeatureFlags } from '@/services/feature-flags';
import { DocumentCategory } from '@/types/document';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import styles from './CancelledFreelook.module.css';

export const CancelledFreelook = async ({
  lineOfBusiness,
  planCode,
  policyNumber,
  activeDocumentsTab,
}: {
  lineOfBusiness: LineOfBusiness;
  planCode: string;
  policyNumber: string;
  activeDocumentsTab: DocumentCategory;
}) => {
  const flags = await getFeatureFlags();

  if (flags?.[FEATURE_FLAGS.TRANSACTION_FREE_LOOK_CANCEL]) {
    return (
      <>
        <div className="card">
          <p className="typography-content-body-bold">
            Your policy with us has ended.
          </p>
          <p className="typography-content-body my-lg">
            This policy was canceled during the free look period.
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
          <b>Your policy with us has ended.</b>&nbsp;This policy was canceled
          during the free look period.
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
            lineOfBusiness={lineOfBusiness}
            currentView={activeDocumentsTab}
          />
        </Suspense>
      </div>
    </div>
  );
};
