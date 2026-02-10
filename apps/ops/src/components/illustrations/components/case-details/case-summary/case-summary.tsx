import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    AssistiveText,
    AssistiveTextVariant,
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
import { useAllAliasesWithSellingCode } from '@deps/components/illustrations/helpers/hooks/user-identity';
import TempNavInactive from '@deps/components/nav-element/temp-nav-inactive/temp-nav-inactive';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { TranslationFiles } from '@deps/config/translations';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import { getStateName } from '@deps/helpers/states.helpers';
import { calculateAge } from '@deps/helpers/string.helpers';
import { patchIllustrationsClientCase } from '@deps/queries/tanstack/illustrations/clientCasesQueries';
import {
    IllustrationsClientCase,
    TransactionType,
} from '@deps/types/illustrations';
import { DEFAULT_ERROR_STRING, capitalize } from '@deps/utils/strings';

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
    const { isAllowWriteClientCase, partyReferenceData } =
        usePermissionsContext();

    const aliases = useAllAliasesWithSellingCode(partyReferenceData);
    const isAgent = aliases?.length ?? 0 > 0;

    const isAllowedToEditCase = isAgent || isAllowWriteClientCase;

    const insuranceDetails = `${capitalize(
        clientCase?.insuredDetails?.sexAtBirth
    )}, Age ${calculateAge(
        clientCase?.insuredDetails?.dateOfBirth?.toString(),
        ''
    )}, ${getStateName(clientCase?.insuredDetails?.state)}`;
    const [insurredFullName, setInsurredFullName] = useState('');
    const [agentFullName, setAgentFullName] = useState('');
    const queryClient = useQueryClient();
    const sideSheet = useSideSheetContextLegacy();

    useEffect(() => {
        if (
            !clientCase?.insuredDetails?.firstName &&
            !clientCase?.insuredDetails?.lastName
        ) {
            setInsurredFullName(DEFAULT_ERROR_STRING);
        } else {
            setInsurredFullName(
                `${clientCase?.insuredDetails?.firstName} ${clientCase?.insuredDetails?.lastName}`
            );
        }
    }, [
        clientCase?.insuredDetails?.firstName,
        clientCase?.insuredDetails?.lastName,
    ]);

    useEffect(() => {
        if (
            !clientCase?.agentDetails?.firstName &&
            !clientCase?.agentDetails?.lastName
        ) {
            setAgentFullName(DEFAULT_ERROR_STRING);
        } else {
            setAgentFullName(
                `${clientCase?.agentDetails?.firstName} ${clientCase?.agentDetails?.lastName}`
            );
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
                isEdit
            />
        );
        sideSheet.handleOpen(true, 500);
    };

    const { mutate } = useMutation({
        mutationKey: ['clientCase', clientCase?.id],
        mutationFn: (data: Partial<IllustrationsClientCase>) =>
            patchIllustrationsClientCase(data),
        onSuccess: () => {
            // Refetch clientCaseData to include new entry
            queryClient.invalidateQueries({
                queryKey: ['clientCaseData', clientCase.id],
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
        // Discart this when date input is replaced with the final verstion of the date picker.
        if (clientCaseData.insuredDetails) {
            clientCaseData.insuredDetails.dateOfBirth = new Date(
                clientCaseData.insuredDetails?.dateOfBirth ?? ''
            );
        }

        mutate(clientCaseData);
        closeSideSheet();
    };

    const isConversion =
        clientCase?.transactionType === TransactionType.CONVERSION;
    const infoItems = isConversion
        ? ['Conversion', clientCase?.isMec && 'MEC'].filter(
              (item): item is string => !!item
          )
        : [];

    const infoText = infoItems.join(', ');

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
                    {isAllowedToEditCase ? (
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
                            <Icon type={IconType.EDIT} height={24} width={24} />
                            {t('clientCase.caseSummary.edit')}
                        </Button>
                    ) : (
                        <TempNavInactive
                            tooltipBody={t('clientCase.clientCasePermissions')}
                            navElementClassName="!bg-transparent"
                        >
                            <Button
                                disabled
                                mode="link"
                                data-testid="edit-btn"
                                aria-label={
                                    t(
                                        'clientCase.caseSummary.editClientCaseButton'
                                    ) as string
                                }
                                type="button"
                                size="small"
                            >
                                {t('clientCase.caseSummary.edit')}
                            </Button>
                        </TempNavInactive>
                    )}
                </div>
            </section>
            <section className={clsx(styles.summary)}>
                <article>
                    <Label>{t('clientCase.caseSummary.insured')}</Label>
                    <PiiWrapper
                        className={clsx(
                            styles.value,
                            'typography-content-value'
                        )}
                    >
                        {insurredFullName}
                    </PiiWrapper>
                    {insuranceDetails && (
                        <PiiWrapper
                            className={clsx(
                                styles.caption,
                                'typography-content-caption'
                            )}
                        >
                            {insuranceDetails}
                        </PiiWrapper>
                    )}
                </article>
                <article>
                    <Label>{t('clientCase.caseSummary.agent')}</Label>
                    <PiiWrapper
                        className={clsx(
                            styles.value,
                            'typography-content-value'
                        )}
                    >
                        {agentFullName}
                    </PiiWrapper>
                    <span
                        className={clsx(
                            styles.caption,
                            'typography-content-caption'
                        )}
                    >
                        {clientCase.agencyName}
                    </span>
                </article>
            </section>
            {isConversion && (
                <section className="mt-4">
                    <article>
                        <AssistiveText
                            text={infoText}
                            variant={AssistiveTextVariant.Info}
                        />
                    </article>
                </section>
            )}
        </header>
    );
};

export default IllustrationCaseSumary;
