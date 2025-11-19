'use client';

import { useRouter } from 'next/navigation';

import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { lineOfBusinessUrlPath } from '@/utils/data';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';

export interface CancelDialogLinkProps {
  planCode: string;
  policyNumber: string;
  lineOfBusiness: LineOfBusiness;
}

export const CancelDialogLink: React.FC<CancelDialogLinkProps> = ({
  planCode,
  policyNumber,
  lineOfBusiness,
}: CancelDialogLinkProps) => {
  const router = useRouter();

  return (
    <ConfirmDialog
      confirmCallback={() =>
        router.push(
          `/coverage/${lineOfBusinessUrlPath(lineOfBusiness)}/${planCode}/${policyNumber}/premium`
        )
      }
      linkText="Cancel"
      message="If you leave now, your payment won't be submitted and you will have to start over."
      title="Leave payment?"
    />
  );
};
