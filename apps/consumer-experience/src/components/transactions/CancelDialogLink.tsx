'use client';

import { useRouter } from 'next/navigation';

import { ConfirmDialogLink } from '../confirm-dialog/ConfirmDialogLink';

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
    <ConfirmDialogLink
      confirmCallback={() =>
        router.push(`/policies/${planCode}/${policyNumber}/premium`)
      }
      linkText="Cancel"
      message="If you leave now, your payment won't be submitted and you will have to start over."
      title="Leave payment?"
    />
  );
};
