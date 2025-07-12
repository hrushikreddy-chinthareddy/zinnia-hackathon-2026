import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    BodyVariant,
    Breadcrumb,
    Button,
    Heading,
    HeadingVariant,
    Icon,
    IconType,
    Label,
    Text,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useState } from 'react';

import CreateClientCaseForm from '@deps/components/client-case/client-case-create/create-client-case-form';
import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { getStateName } from '@deps/helpers/states.helpers';
import { calculateAge } from '@deps/helpers/string.helpers';
import { patchIllustrationsClientCase } from '@deps/queries/tanstack/illustrations/clientCasesQueries';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { IllustrationsClientCase } from '@deps/types/illustrations';

import styles from './case-summary.module.css';

interface IllustrationCaseSumaryProps {
    clientCaseName?: string;
    insuredName?: string;
    agentName?: string;
    insuranceDetails?: string;
    clientCase: IllustrationsClientCase;
}

const IllustrationCaseSumary = ({
    clientCase,
}: IllustrationCaseSumaryProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    const insuranceDetails = `${
        clientCase?.insuredDetails?.sexAtBirth
    }, Age ${calculateAge(
        clientCase?.insuredDetails?.dateOfBirth?.toString(),
        ''
    )}, ${getStateName(clientCase?.insuredDetails?.state)}`;
    const [insurredFullName, setInsurredFullName] = useState('');
    const [agentFullName, setAgentFullName] = useState('');
    const queryClient = useQueryClient();
    const sideSheet = useSideSheetContext();

    useEffect(() => {
        if (
            clientCase?.insuredDetails?.firstName &&
            clientCase?.insuredDetails?.lastName
        ) {
            setInsurredFullName(
                `${clientCase?.insuredDetails?.firstName} ${clientCase?.insuredDetails?.lastName}`
            );
        } else if (
            clientCase?.insuredDetails?.firstName &&
            !clientCase?.insuredDetails?.lastName
        ) {
            setInsurredFullName(`${clientCase?.insuredDetails?.firstName}`);
        } else if (
            !clientCase?.insuredDetails?.firstName &&
            clientCase?.insuredDetails?.lastName
        ) {
            setInsurredFullName(`${clientCase?.insuredDetails?.lastName}`);
        } else {
            setInsurredFullName(DEFAULT_ERROR_STRING);
        }
    }, [
        clientCase?.insuredDetails?.firstName,
        clientCase?.insuredDetails?.lastName,
    ]);

    useEffect(() => {
        if (
            clientCase?.agentDetails?.firstName &&
            clientCase?.agentDetails?.lastName
        ) {
            setAgentFullName(
                `${clientCase?.agentDetails?.firstName} ${clientCase?.agentDetails?.lastName}`
            );
        } else if (
            clientCase?.agentDetails?.firstName &&
            !clientCase?.agentDetails?.lastName
        ) {
            setAgentFullName(`${clientCase?.agentDetails?.firstName}`);
        } else if (
            !clientCase?.agentDetails?.firstName &&
            clientCase?.agentDetails?.lastName
        ) {
            setAgentFullName(`${clientCase?.agentDetails?.lastName}`);
        } else {
            setInsurredFullName(DEFAULT_ERROR_STRING);
        }
    }, [
        clientCase?.agentDetails?.firstName,
        clientCase?.agentDetails?.lastName,
    ]);

    const closeSideSheet = useCallback(() => {
        sideSheet.handleOpen(false);
    }, [sideSheet]);

    const onEdit = () => {
        const createClientCaseForm = t(
            'clientCase.createClientCaseForm.editClientCaseSideSheetTitle'
        );
        sideSheet.changeSideSheetContent(
            createClientCaseForm,
            <CreateClientCaseForm
                onCancel={closeSideSheet}
                onSubmit={onSubmitForm}
                clientCase={clientCase}
            />
        );
        sideSheet.handleOpen(true, 500);
    };

    const { mutate } = useMutation({
        mutationKey: ['clientCase', clientCase?.id],
        mutationFn: (data: Partial<IllustrationsClientCase>) =>
            patchIllustrationsClientCase(data),
        onSuccess: (d) => {
            // Refetch clientCaseData to include new entry
            queryClient.invalidateQueries({
                queryKey: ['clientCaseSearch'],
            });
        },
        onMutate: () => {
            // add loading logic
        },
        onError: (e) => {
            // add error logic
        },
    });

    const onSubmitForm = (clientCaseData: Partial<IllustrationsClientCase>) => {
        mutate(clientCaseData);
        closeSideSheet();
    };

    return (
        <header className={clsx(styles.header)}>
            <section>
                <div className={clsx(styles.breadcrumb)}>
                    <Breadcrumb
                        Component={Link}
                        text={t('illustrations')}
                        url={'/illustrations/client-cases'}
                    />
                    <span>/</span>
                    <Text as={BodyVariant.span} className="">
                        {clientCase?.title ??
                            t('clientCase?.caseSummary.untitledCase')}
                    </Text>
                </div>
                <div className={clsx(styles.title)}>
                    <Heading as={HeadingVariant.h1}>
                        {clientCase?.title ??
                            (t(
                                'clientCase.caseSummary.untitledCase'
                            ) as string)}
                    </Heading>
                    <Button
                        mode="link"
                        data-testid="edit-btn"
                        aria-label={
                            t(
                                'clientCase.caseSummary.editClientCaseButton'
                            ) as string
                        }
                        type="button"
                        size="small"
                        className={styles.linkButton}
                        onClick={onEdit}
                    >
                        <Icon type={IconType.EDIT_ALT} height={24} width={24} />
                        {t('clientCase.caseSummary.edit')}
                    </Button>
                </div>
            </section>
            <section className={clsx(styles.summary)}>
                <article>
                    <Label>{t('clientCase.caseSummary.insured')}</Label>
                    <span
                        className={clsx(
                            styles.value,
                            'typography-content-value'
                        )}
                    >
                        {insurredFullName}
                    </span>
                    {insuranceDetails && (
                        <span
                            className={clsx(
                                styles.caption,
                                'typography-content-caption'
                            )}
                        >
                            {insuranceDetails}
                        </span>
                    )}
                </article>
                <article>
                    <Label>{t('clientCase.caseSummary.agent')}</Label>
                    <span
                        className={clsx(
                            styles.value,
                            'typography-content-value'
                        )}
                    >
                        {agentFullName}
                    </span>
                </article>
            </section>
        </header>
    );
};

export default IllustrationCaseSumary;
