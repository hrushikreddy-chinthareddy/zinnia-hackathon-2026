import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import 'react-pdf/dist/Page/TextLayer.css';

import { SimpleOption } from '@deps/components/autocomplete/autocomplete.types';
import { FieldSize } from '@deps/components/fields/field';
import SendDocument from '@deps/components/otp-send-document/components/document';
import { Loader } from '@deps/components/page-loader';
import Select from '@deps/components/select/select';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import {
    AvailableFormsTransaction,
    SendDocumentFormParts,
} from '@deps/models/case/send-document';
import { searchForms } from '@deps/queries/api/c2web';
import { Policy } from '@zinnia/api-types/types/sor';
type FormSelectionProps = {
    policy?: Policy;
    ctiCallNumber: string;
    correlationId?: string;
    availableFormsTransactions: AvailableFormsTransaction[];
    formDetails: SendDocumentFormParts;
    setFormDetails: (val: SendDocumentFormParts) => void;
};

function TransactionDocumentSelection({
    policy,
    ctiCallNumber,
    availableFormsTransactions,
    formDetails,
    setFormDetails,
    correlationId,
}: FormSelectionProps) {
    const { t } = useTranslation();
    const transactionTypes = availableFormsTransactions?.map((transaction) => {
        return { label: transaction.name, value: transaction.id };
    });
    const [transactionSubTypeOptions, setTransactionSubTypeOptions] = useState<
        SimpleOption[]
    >(formDetails?.transactionSubType?.list || []);
    const [error, setError] = useState<string>('');
    const [loader, setLoader] = useState(false);
    const [document, setDocument] = useState(formDetails);

    useEffect(() => {
        setFormDetails(document);
    }, [document]);

    const onTransactionTypeChange = (transactionType: string) => {
        setDocument((ogFormDetails) => ({
            ...ogFormDetails,
            transactionType: {
                selected: transactionType,
                list: transactionTypes,
            },
            document: { selected: null, list: null },
        }));

        const getSubTypes = async (transactionType: string) => {
            if (transactionType !== '') {
                try {
                    const options =
                        availableFormsTransactions
                            .find((option) => option.id === transactionType)
                            ?.transactionSubType.map((transaction) => {
                                return {
                                    label: transaction.name,
                                    value: transaction.id,
                                };
                            }) || [];

                    setTransactionSubTypeOptions(options);
                } catch (e: any) {
                    console.error(
                        'GetTransactionSubTypes::Error retrieving transaction sub types',
                        e
                    );
                }
            }
        };

        getSubTypes(transactionType);
    };

    const onTransactionSubTypeChange = (transactionSubType: string) => {
        setError('');
        const getForms = async (tranSubType: string) => {
            setLoader(true);
            setDocument((ogForomdetais) => ({
                ...ogForomdetais,
                transactionSubType: {
                    selected: transactionSubType,
                    list: transactionSubTypeOptions,
                },
            }));

            if (
                transactionSubType !== '' &&
                formDetails.transactionType.selected !== null &&
                policy
            ) {
                const formSearchRequestBody = {
                    contractNumber: policy.policyNumber ?? '',
                    planCode: policy.product?.planCode ?? '',
                    transactionType: formDetails?.transactionType?.selected,
                    transactionSubType: tranSubType,
                    carrier: policy.carrierId ?? '',
                    issueState: policy.issueState ?? '',
                    ctiCallNumber: ctiCallNumber ?? '',
                };

                try {
                    const response = await searchForms(formSearchRequestBody, {
                        correlationId,
                    });
                    if (response) {
                        setDocument((ogFormDetails) => ({
                            ...ogFormDetails,
                            document: { selected: response[0], list: response },
                        }));
                    }
                    setLoader(false);
                } catch (e: any) {
                    setLoader(false);
                    setError(e?.message as string);
                    console.error(
                        'GetCallCenterForms::Error call center forms',
                        e
                    );
                }
            }
        };

        getForms(transactionSubType);
    };

    return (
        <>
            <Select
                className="max-w-xs"
                label={t(`allFields.transaction`) ?? ''}
                options={transactionTypes}
                onChange={(val: string) => onTransactionTypeChange(val)}
                size={FieldSize.Small}
                value={formDetails.transactionType?.selected || ''}
                name="transactionType"
                labelTooltip={t(`allFields.transaction`) ?? ''}
                labelTooltipBody={t(`allFields.transaction`) ?? ''}
                disabled={!transactionTypes.length}
            />
            <Select
                className="my-4 max-w-xs"
                label={t(`allFields.subtype`) ?? ''}
                options={transactionSubTypeOptions}
                onChange={(val: string) => onTransactionSubTypeChange(val)}
                size={FieldSize.Small}
                value={formDetails.transactionSubType?.selected || ''}
                name="transactionSubType"
                labelTooltip={t(`allFields.subtype`) ?? ''}
                labelTooltipBody={t(`allFields.subtype`) ?? ''}
                disabled={!transactionSubTypeOptions.length}
            />
            {loader ? (
                <Loader />
            ) : (
                <>
                    {formDetails?.document?.list?.length === 0 ? (
                        <Typography
                            variant={TypographyVariant.FieldLabel}
                            className="mt-4"
                        >
                            {t('allFields.noFormsFound')}
                        </Typography>
                    ) : (
                        <SendDocument
                            documents={formDetails?.document?.list || []}
                            selectedFormId={
                                formDetails?.document?.selected?.formId
                            }
                        />
                    )}
                </>
            )}
            {error && (
                <AssistiveText
                    text={error}
                    variant={AssistiveTextVariant.Error}
                    className="mt-2"
                />
            )}
        </>
    );
}

export default TransactionDocumentSelection;
