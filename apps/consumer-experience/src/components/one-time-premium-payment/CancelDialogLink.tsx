'use client';

import { useRouter } from 'next/navigation';

import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';

export interface CancelDialogLinkProps {
  planCode: string;
  policyNumber: string;
}

export const CancelDialogLink: React.FC<CancelDialogLinkProps> = ({
  planCode,
  policyNumber,
}: CancelDialogLinkProps) => {
  const router = useRouter();

  return (
    <ConfirmDialog
      confirmCallback={() =>
        router.push(`/coverage/${planCode}/${policyNumber}/premium`)
      }
      linkText="Cancel"
      message="If you leave now, your payment won't be submitted and you will have to start over."
      title="Leave payment?"
    />
  );
};
