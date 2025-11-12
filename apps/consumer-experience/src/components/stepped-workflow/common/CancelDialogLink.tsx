'use client';

import { useRouter } from 'next/navigation';

import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { useGetBasePolicyPath } from '@/hooks/use-get-base-policy-path';

export interface CancelDialogLinkProps {
  bodyText?: string;
  linkText?: string;
  cancelUrl?: string;
  titleText?: string;
}

export const CancelDialogLink: React.FC<CancelDialogLinkProps> = ({
  bodyText = 'Are you sure you want to cancel this transaction?',
  linkText = 'Cancel',
  cancelUrl,
  titleText = 'Leave this transaction?',
}: CancelDialogLinkProps) => {
  const router = useRouter();

  const baseUrl = useGetBasePolicyPath();

  const confirmCancelUrl = cancelUrl || baseUrl;

  return (
    <ConfirmDialog
      confirmCallback={() => router.push(confirmCancelUrl)}
      linkText={linkText}
      message={bodyText}
      title={titleText}
    />
  );
};
