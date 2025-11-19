import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QueryKeys } from '@/queries/query-keys';
import { markAsReadMutationOptions } from '@/queries/query-options';

import { createAcknowledgedEntry } from '../utils';

/**
 *
 *  // mutation to acknowledge a specific notification
 */
export const useAcknowledgeCaseMutate = ({
  planCode,
  policyNumber,
}: {
  planCode: string;
  policyNumber: string;
}) => {
  const queryClient = useQueryClient();

  const acknowledgedQueryKey = [
    QueryKeys.NOTIFICATIONS,
    QueryKeys.NOTIFICATION_ACKNOWLEDGMENT,
  ];
  return useMutation({
    ...markAsReadMutationOptions({ planCode, policyNumber }),
    async onMutate({ id, stepsToAcknowledge }) {
      await queryClient.cancelQueries({ queryKey: acknowledgedQueryKey });

      const previousAcknowledged =
        queryClient.getQueryData(acknowledgedQueryKey);

      queryClient.setQueryData(acknowledgedQueryKey, (old: any[] = []) => {
        const newEntry = createAcknowledgedEntry(
          planCode,
          policyNumber,
          id,
          stepsToAcknowledge
        );

        const existingIndex = old.findIndex(
          item => item.caseId?.toString() === id.toString()
        );

        if (existingIndex !== -1) {
          const copy = [...old];
          copy[existingIndex] = newEntry;
          return copy;
        }

        return [newEntry, ...old];
      });

      return { previousAcknowledged };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousAcknowledged) {
        queryClient.setQueryData(
          acknowledgedQueryKey,
          context.previousAcknowledged
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: acknowledgedQueryKey });
    },
  });
};
