import {
    Button,
    FieldData,
    FieldSize,
    FieldStatus,
    Label,
    Select,
} from '@zinnia/bloom/components';
import { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

import { getCaseDetails } from '@deps/queries/api/cases';
import { client } from '@deps/queries/api-utils/client';

import styles from './test-harness.module.css';

interface Metadata {
    parentCarrierCode: string;
    policyNumber: string;
    planCode: string;
    docClassification: string;
    docCategory: string;
    documentType: string;
    documentTypeDescription: string;
    docAccessLevel: string;
    documentDate: string;
    deliveryMethod: string;
    sourceFileName: string;
    fileType: string;
    correlationId: string;
    zinniaLiveCaseId: string;
}

interface FormData {
    file: FileList | null;
    metadata: Metadata;
}

enum DocType {
    CNTCHG = 'CNTCHG',
    BNKCHG = 'BNKCHG',
    EDTRM = 'EDTRM',
    FICON = 'FICON',
}

const selectOptions = [
    {
        textValue: 'Address Change, Email Change, or Phone Number Change',
        value: DocType.CNTCHG,
    },

    {
        textValue: 'Bank Account Change',
        value: DocType.BNKCHG,
    },
    {
        textValue: 'Communication Preference Change',
        value: DocType.EDTRM,
    },
    {
        textValue:
            'Full Surrender, Partial Withdrawal One Time, Free Look Cancellation, Fund Allocations Change, or Fund Transfer',
        value: DocType.FICON,
    },
];

export const CompleteCase = () => {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState('');
    const [error, setError] = useState('');

    const {
        control,
        handleSubmit,
        register,
        formState: { isSubmitting, errors },
    } = useForm<FormData>({
        defaultValues: {
            file: null,
            metadata: {
                docCategory: 'CORRESPONDENCE',
                documentType: '',
                documentTypeDescription: '',
                docAccessLevel: 'CLIENT_COPY',
                documentDate: new Date().toISOString(),
                deliveryMethod: 'PRINT',
                docClassification: 'OUTBOUND',
                sourceFileName: 'demo-correspondence.pdf', //user defined required
                fileType: 'PDF',
                correlationId: uuidv4(),
                zinniaLiveCaseId: '',
            },
        },
    });

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        setLoading(true);
        setError('');
        if (!data.file) {
            setError('Please select a file');
            setLoading(false);
            return;
        }

        try {
            const caseDetails = await getCaseDetails(
                data.metadata.zinniaLiveCaseId
            );

            const policyNumber = caseDetails?.policyNumber;
            const planCode = caseDetails?.planCode;
            const parentCarrierCode = caseDetails?.carrier;

            const formData = new FormData();

            formData.append('file', data.file[0]);
            formData.append(
                'metadata',
                JSON.stringify({
                    ...data.metadata,
                    policyNumber,
                    planCode,
                    parentCarrierCode,
                })
            ); // need to add in caseID here too
            await client.post('/api/test-harness/upload-document', formData);
            await client.put('/api/test-harness/complete-case', {
                caseId: data.metadata.zinniaLiveCaseId,
            });
            setResponse(`${data.metadata.zinniaLiveCaseId} has been completed`);
        } catch (e) {
            setResponse('');
            setError('Error completing case');
            // console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={styles.fields}>
                <input
                    accept="application/pdf"
                    type="file"
                    {...register('file')}
                    required
                />

                <Controller
                    control={control}
                    name="metadata.zinniaLiveCaseId"
                    rules={{ required: true }}
                    render={({ field }) => (
                        <div>
                            <FieldData
                                fieldStatus={
                                    errors.metadata?.zinniaLiveCaseId
                                        ? FieldStatus.ERROR
                                        : FieldStatus.DEFAULT
                                }
                                id="caseId"
                                fieldSize={FieldSize.Small}
                                onChange={field.onChange}
                                errorMessage="Please provide a valid case id"
                                value={field.value}
                                label={
                                    <Label
                                        status={FieldStatus.DEFAULT}
                                        labelFor="caseId"
                                    >
                                        Case Id
                                    </Label>
                                }
                            />
                        </div>
                    )}
                />

                <Controller
                    control={control}
                    name="metadata.documentType"
                    rules={{ required: true }}
                    render={({ field }) => (
                        <div>
                            <Select
                                options={selectOptions}
                                value={field.value}
                                id="doc-type-select"
                                onValueChange={field.onChange}
                                fieldSize={FieldSize.Small}
                                placeholder="Select Document Type"
                                label={
                                    <Label
                                        status={FieldStatus.DEFAULT}
                                        labelFor="doc-type-select"
                                    >
                                        Document Type
                                    </Label>
                                }
                            />
                        </div>
                    )}
                />
                <Controller
                    control={control}
                    name="metadata.documentTypeDescription"
                    rules={{ required: true }}
                    render={({ field }) => (
                        <div>
                            <FieldData
                                fieldStatus={
                                    errors.metadata?.documentTypeDescription
                                        ? FieldStatus.ERROR
                                        : FieldStatus.DEFAULT
                                }
                                id="documentTypeDescription"
                                fieldSize={FieldSize.Small}
                                onChange={field.onChange}
                                errorMessage="Please provide a valid description"
                                value={field.value}
                                label={
                                    <Label
                                        status={FieldStatus.DEFAULT}
                                        labelFor="documentTypeDescription"
                                    >
                                        Document Name/Description
                                    </Label>
                                }
                            />
                        </div>
                    )}
                />
            </div>
            <Button
                className={styles.buttonWrapper}
                disabled={loading || isSubmitting}
                onClick={handleSubmit(onSubmit)}
            >
                Complete case
            </Button>
            <p>Completed Case Id: {response}</p>
            {error && <p>{error}</p>}
        </>
    );
};
