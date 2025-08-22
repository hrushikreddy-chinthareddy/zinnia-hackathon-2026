import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';

import {
    archiveIllustrationInClientCase,
    selectIllustrationForClientCase,
    unarchiveIllustrationInClientCase,
} from '@deps/queries/tanstack/illustrations/clientCasesQueries';
import { patchNewBusinessEApp } from '@deps/queries/tanstack/newBusinessQueries/newBusinessQueries';

import { useSelectedIllustration } from '../../providers/SelectedIllustrationProvider';

export const useIllustrationActions = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const {
        setIsLoadingSelectForApplication,
        selectedIllustration,
        newBusinessCaseId,
        eAppLink,
    } = useSelectedIllustration();

    const selectIllustrationMutation = useMutation({
        mutationKey: [
            'selectIllustrationForApplication',
            selectedIllustration?.illustration.id,
            selectedIllustration?.illustration.productType,
        ],
        mutationFn: async ({
            clientCaseId,
            illustrationId,
        }: {
            clientCaseId: string;
            illustrationId: string;
        }) => {
            const result = await selectIllustrationForClientCase(
                clientCaseId,
                illustrationId
            );
            return { data: { eAppId: result?.eAppId } };
        },
        onMutate: () => setIsLoadingSelectForApplication(true),
        onSuccess: ({
            data: { eAppId },
        }: {
            data: { eAppId: string | undefined };
        }) => {
            if (!eAppId) return; // TODO: handle rollback on error
            return setSelectedIllustrationOnNewBusiness.mutateAsync({
                eAppId,
                illustrationId: selectedIllustration?.illustration.id || '',
                newBusinessCaseId: newBusinessCaseId || '',
            });
        },
        onSettled: () => setIsLoadingSelectForApplication(false),
    });

    const setSelectedIllustrationOnNewBusiness = useMutation({
        mutationKey: [
            'selectIllustrationOnNewBusiness',
            selectedIllustration?.illustration.id,
        ],
        mutationFn: ({
            eAppId,
            illustrationId,
            newBusinessCaseId,
        }: {
            eAppId: string;
            illustrationId: string;
            newBusinessCaseId: string;
        }) => {
            return patchNewBusinessEApp(
                eAppId,
                illustrationId,
                newBusinessCaseId
            );
        },
        onSuccess: () => {
            const { clientCaseId, illustrationId } = router.query;

            queryClient.invalidateQueries({
                queryKey: ['illustrationData', illustrationId],
            });
            queryClient.invalidateQueries({
                queryKey: ['clientCaseData', clientCaseId],
            });

            if (!eAppLink) {
                return;
            }

            // Using this method to open a link to avoid popup blockers
            const myAnchor = document.createElement('a');
            myAnchor.href = eAppLink;
            myAnchor.target = '_blank';
            myAnchor.rel = 'noopener noreferrer';
            document.body.appendChild(myAnchor);
            myAnchor.click();
            document.body.removeChild(myAnchor);
        },
    });

    const archiveIllustrationMutation = useMutation({
        mutationKey: [
            'archiveIllustrationForApplication',
            selectedIllustration?.illustration.id,
        ],
        mutationFn: ({
            clientCaseId,
            illustrationId,
        }: {
            clientCaseId: string;
            illustrationId: string;
        }) => archiveIllustrationInClientCase(clientCaseId, illustrationId),
        onSuccess: () => {
            const { clientCaseId, illustrationId } = router.query;

            queryClient.invalidateQueries({
                queryKey: ['illustrationData', illustrationId],
            });
            queryClient.invalidateQueries({
                queryKey: ['clientCaseData', clientCaseId],
            });
        },
        onMutate: () => {},
        onError: () => {},
    });

    const unarchiveIllustrationMutation = useMutation({
        mutationKey: [
            'unarchiveIllustrationForApplication',
            selectedIllustration?.illustration.id,
        ],
        mutationFn: ({
            clientCaseId,
            illustrationId,
        }: {
            clientCaseId: string;
            illustrationId: string;
        }) => unarchiveIllustrationInClientCase(clientCaseId, illustrationId),
        onSuccess: () => {
            const { clientCaseId, illustrationId } = router.query;

            queryClient.invalidateQueries({
                queryKey: ['illustrationData', illustrationId],
            });
            queryClient.invalidateQueries({
                queryKey: ['clientCaseData', clientCaseId],
            });
        },
        onMutate: () => {},
        onError: () => {},
    });

    return {
        selectIllustrationMutation,
        archiveIllustrationMutation,
        unarchiveIllustrationMutation,
    };
};
