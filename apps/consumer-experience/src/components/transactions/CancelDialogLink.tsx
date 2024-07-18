import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { ConfirmDialogLink } from "../confirm-dialog/ConfirmDialogLink";

export interface CancelDialogLinkProps {
    planCode: string;
    policyNumber: string;
    router: AppRouterInstance;
}

export const CancelDialogLink: React.FC<CancelDialogLinkProps> = ({
    planCode,
    policyNumber,
    router,
  }: CancelDialogLinkProps) => {
    return (
        <ConfirmDialogLink
            confirmCallback={() => router.push(`/policies/${planCode}/${policyNumber}/premium`)}
            linkText="Cancel"
            message="If you leave now, your payment won't be submitted and you will have to start over."
            title="Leave payment?"
        />
    );
};
