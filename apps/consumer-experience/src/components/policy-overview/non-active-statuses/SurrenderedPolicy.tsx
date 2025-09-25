import { LineOfBusiness } from '@xd/api-types/dist/generated-types/bpm';
import { Suspense } from 'react';

import { DocumentsView } from '@/app/(authenticated)/coverage/shared-views/documents-view/DocumentsView';
import { LargeSkeleCard } from '@/components/skeleton-loader/policy-page/policy-page-skeletons';
import { getFeatureFlags } from '@/services/feature-flags';
import { DocumentCategory } from '@/types/document';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
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

  if (!flags?.[FEATURE_FLAGS.TRANSACTION_FULL_SURRENDER]) {
    return (
      <div className="card">
        <p className="typography-content-body-bold">
          Your policy with us has ended.
        </p>
        <p className="typography-content-body my-lg">
          This policy was surrendered due to insufficient funds or because you
          withdrew the full account value.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="typography-content-body-bold">
        Your policy with us has ended.
      </p>
      <p className="typography-content-body my-lg">
        This policy was surrendered due to insufficient funds or because you
        withdrew the full account value.
      </p>
      <h2 style={{ marginBottom: 'var(--space-2)' }}>Documents</h2>
      <Suspense fallback={<LargeSkeleCard />}>
        <DocumentsView
          planCode={planCode}
          policyNumber={policyNumber}
          lineOfBusiness={LineOfBusiness.LIFE}
          currentView={activeDocumentsTab}
        />
      </Suspense>
    </div>
  );
};
