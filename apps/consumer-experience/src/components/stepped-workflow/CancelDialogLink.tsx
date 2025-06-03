'use client';

import { useRouter } from 'next/navigation';

import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';

export interface CancelDialogLinkProps {
  bodyText?: string;
  linkText?: string;
  cancelUrl: string;
  titleText?: string;
}

export const CancelDialogLink: React.FC<CancelDialogLinkProps> = ({
  bodyText,
  linkText = 'Cancel',
  cancelUrl,
  titleText = 'Leave this transaction?',
}: CancelDialogLinkProps) => {
  const router = useRouter();

  return (
    <ConfirmDialog
      confirmCallback={() => router.push(cancelUrl)}
      linkText={linkText}
      message={bodyText}
      title={titleText}
    />
  );
};
