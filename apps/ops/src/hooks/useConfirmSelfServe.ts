import { useCallback, useEffect, useRef, useState } from 'react';

import {
    SelfServeTransaction,
    SelfServeTransactionSubmitResult,
} from '@deps/containers/self-serve-transaction/types';
import { browserLogError } from '@deps/utils/browser-logging';

export const useConfirmSelfServe = (
    transactionType: SelfServeTransaction,
    customData: any,
    submitResponseHandler: (
        payload: any
    ) => Promise<SelfServeTransactionSubmitResult>,
    autoSubmit = true
) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean | null>(null);
    const [response, setResponse] = useState<any | null>(null);
    const [newCaseId, setNewCaseId] = useState<string | null>(
        customData.caseId ?? null
    );
    const [submitNigo, setSubmitNigo] = useState<boolean | null>(null);

    const submittedRef = useRef(false);

    const submit = useCallback(async () => {
        if (!submitResponseHandler) return;
        setLoading(true);
        setSuccess(null);
        setResponse(null);
        setNewCaseId(customData.caseId ?? null);
        setSubmitNigo(null);

        try {
            const res = await submitResponseHandler(customData);
            if (res) {
                setResponse(res.response);
                setSuccess(res.isSuccess);
                setNewCaseId(res.caseId ?? null);
                setSubmitNigo(res.submitNigo ?? null);
            }
        } catch (error) {
            browserLogError(`Error submitting ${transactionType}::`, { error });
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    }, [customData, submitResponseHandler, transactionType]);

    const resetAndSubmit = useCallback(async () => {
        submittedRef.current = false;
        await submit();
    }, [submit]);

    useEffect(() => {
        if (!autoSubmit) return;
        if (!submittedRef.current) {
            submittedRef.current = true;
            submit();
        }
    }, [submit, autoSubmit]);

    return {
        loading,
        success,
        response,
        newCaseId,
        submitNigo,
        submit: resetAndSubmit,
    };
};
