import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { ComponentProps, useCallback, useEffect } from 'react';

import CreateClientCaseForm from '@deps/components/client-case/client-case-create/create-client-case-form';
import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { postIllustrationsClientCase } from '@deps/queries/tanstack/illustrations/clientCasesQueries';
import { IllustrationsClientCase } from '@deps/types/illustrations';

import IllustrationsPage, { getServerSideProps } from './index';

export default function NewClientCase(
    props: ComponentProps<typeof IllustrationsPage>
) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const sideSheet = useSideSheetContext();
    const searchParams = useSearchParams();

    const closeSideSheet = useCallback(
        () =>
            router.push({
                pathname: '/illustrations/client-cases/',
                query: Object.fromEntries(searchParams),
            }),
        [router, searchParams]
    );

    const { mutate } = useMutation({
        mutationFn: (data: Partial<IllustrationsClientCase>) =>
            postIllustrationsClientCase(data),
        onSuccess: () => {
            // Refetch clientCaseData to include new entry
            queryClient.invalidateQueries({
                queryKey: ['clientCaseSearch'],
            });
        },

        onMutate: () => {
            // add loading logic
        },
        onError: () => {
            // add error logic
        },
    });

    const onSubmitForm = (clientCaseData: Partial<IllustrationsClientCase>) => {
        mutate(clientCaseData as unknown as IllustrationsClientCase);
        closeSideSheet();
    };

    useEffect(() => {
        sideSheet.events.on('close', closeSideSheet);

        return () => sideSheet.events.off('close', closeSideSheet);
    }, [closeSideSheet, sideSheet.events]);

    useEffect(() => {
        const createClientCaseForm = t(
            'clientCase.createClientCaseForm.clientCaseSideSheetTitle'
        );
        sideSheet.changeSideSheetContent(
            createClientCaseForm,
            <CreateClientCaseForm
                onCancel={closeSideSheet}
                onSubmit={onSubmitForm}
            />
        );
        sideSheet.handleOpen(true, 500);
    }, []);
    // We cannot add SideSheet as a dependency because updating the content also changes this reference

    return IllustrationsPage(props);
}

export { getServerSideProps };
