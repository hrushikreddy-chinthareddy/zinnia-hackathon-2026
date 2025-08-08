import { useParams } from 'next/navigation';

/**
 * Returns the clientCaseId from the curent page route
 */
export function useClientCaseId() {
    const { clientCaseId } = useParams<{ clientCaseId: string }>();
    return clientCaseId;
}
