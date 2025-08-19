import {
    FieldSize,
    FieldStatus,
    FieldData,
    Select,
    Label,
    Button,
} from '@zinnia/bloom/components';
import { AxiosResponse } from 'axios';
import { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import NavLink from '@deps/components/nav-element/nav-link/nav-link';
import { client } from '@deps/queries/api-utils/client';
import { isEvglDemo, isFarmersTraining } from '@deps/utils/environment.helpers';
import {
    IssuanceType,
    IssuanceRequestBody,
    TestHarnessCreateResponse,
    PolicyState,
} from '@deps/utils/test-harness/types';

import styles from './test-harness.module.css';

interface TestHarnessInputs {
    type: IssuanceType;
    policyState: PolicyState;
    govtId: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    policyNumber: string;
    agent?: string;
    agentFirstName?: string;
    agentLastName?: string;
    agentProducerKey?: string;
    agentLicenseNumber?: string;
    agentCompanyProducerID?: string;
}
const evergladesTestPolicies = [
    {
        textValue: 'EVGL Myga Policy 3 Year',
        value: IssuanceType.EVGL_MYGA_3,
    },
    {
        textValue: 'EVGL Myga Policy 5 Year',
        value: IssuanceType.EVGL_MYGA_5,
    },
    {
        textValue: 'EVGL Myga Policy 7 Year',
        value: IssuanceType.EVGL_MYGA_7,
    },
    {
        textValue: 'IUL Policy',
        value: IssuanceType.IUL,
    },
    {
        textValue: 'UL Policy',
        value: IssuanceType.UL,
    },
];

const farmersTestPolicies = [
    {
        textValue: 'Farmers IUL Policy',
        value: IssuanceType.FARMERS_IUL,
    },
    {
        textValue: 'Farmers Term Policy',
        value: IssuanceType.FARMERS_TERM,
    },
    {
        textValue: 'Farmers ROP Policy',
        value: IssuanceType.FARMERS_ROP,
    },
];

const policyTypeOptions = [
    ...(isEvglDemo() ? evergladesTestPolicies : []),
    ...(isFarmersTraining() ? farmersTestPolicies : []),
];

const policyStateOptions = [
    {
        textValue: 'Pending Issued',
        value: PolicyState.PENDING_ISSUED,
    },
    {
        textValue: 'Active Free Look',
        value: PolicyState.ACTIVE_FREELOOK,
    },
    {
        textValue: 'Active',
        value: PolicyState.ACTIVE,
    },
];

const agentSelectOptions = [
    ...(isEvglDemo()
        ? [
              {
                  textValue: 'KEELY.FOUX+EVERGLADESAGENT@ZINNIA.COM',
                  value: 'Agent1',
              },
              {
                  textValue: 'ALI.KHATAMI+EVERGLADESAGENT@ZINNIA.COM',
                  value: 'Agent2',
              },
          ]
        : []),

    ...(isFarmersTraining()
        ? [
              {
                  textValue: 'fitz953@farmersoktauser.com',
                  value: 'Agent3',
              },
          ]
        : []),
];

const evergladesAgents = {
    Agent1: {
        firstName: 'JOHN',
        lastName: 'SMITH',
        producerKey: 'Agent1',
        licenseNumber: '',
        companyProducerID: 'EV000001',
    },
    Agent2: {
        firstName: 'PETER',
        lastName: 'ANTHONY',
        producerKey: 'Agent2',
        licenseNumber: '',
        companyProducerID: 'EV000002',
    },
};

const farmersAgents = {
    Agent3: {
        firstName: 'Johnny',
        lastName: 'Fitzmaurice',
        producerKey: '97447600037877',
        licenseNumber: '',
        companyProducerID: '97447600037877',
    },
};

const defaultAgent = isEvglDemo()
    ? { agent: 'Agent1', ...evergladesAgents.Agent1 }
    : { agent: 'Agent3', ...farmersAgents.Agent3 };

const agentValues = {
    ...(isEvglDemo() ? evergladesAgents : {}),
    ...(isFarmersTraining() ? farmersAgents : {}),
};

export const CreatePolicy = () => {
    const [response, setResponse] =
        useState<AxiosResponse<TestHarnessCreateResponse>>();
    const [error, setError] = useState('');
    const generateRandomPolNumber = () =>
        Math.floor(10000000 + Math.random() * 90000000).toString();

    const {
        control,
        handleSubmit,
        setValue,
        formState: { isSubmitting, errors },
    } = useForm<TestHarnessInputs>({
        defaultValues: {
            type: IssuanceType.EVGL_MYGA_3,
            govtId: '599054812',
            email: '', //set defaults here
            firstName: 'ZaharaQA',
            lastName: '294',
            phoneNumber: '5555555555',
            policyNumber: '',
            policyState: PolicyState.PENDING_ISSUED,
            agent: defaultAgent.agent,
            agentFirstName: defaultAgent.firstName,
            agentLastName: defaultAgent.lastName,
            agentProducerKey: defaultAgent.producerKey,
            agentLicenseNumber: defaultAgent.licenseNumber,
            agentCompanyProducerID: defaultAgent.companyProducerID,
        },
    });

    const onSubmit: SubmitHandler<TestHarnessInputs> = async (data) => {
        setError('');
        setResponse(undefined);
        try {
            const response = await client.post<
                IssuanceRequestBody,
                AxiosResponse<TestHarnessCreateResponse>
            >('/api/test-harness/create-policy', {
                type: data.type,
                govtId: data.govtId,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber,
                policyNumber: data.policyNumber || generateRandomPolNumber(),
                policyState: data.policyState,
                agentFirstName: data.agentFirstName,
                agentLastName: data.agentLastName,
                agentProducerKey: data.agentProducerKey,
                agentLicenseNumber: data.agentLicenseNumber,
                agentCompanyProducerID: data.agentCompanyProducerID,
            });

            setResponse(response.data);
        } catch (error: unknown) {
            setResponse(undefined);
            if (error instanceof Error) {
                setError(`Error: ${error.message}`);
            } else {
                setError('An unknown error occurred');
            }
        }
    };
    return (
        <>
            <div className={styles.fields}>
                <Controller
                    control={control}
                    name="type"
                    rules={{ required: true }}
                    render={({ field }) => (
                        <div>
                            <Select
                                options={policyTypeOptions}
                                value={field.value}
                                id="field-select"
                                onValueChange={field.onChange}
                                fieldSize={FieldSize.Small}
                                placeholder="Select Policy Type"
                                label={
                                    <Label
                                        status={FieldStatus.DEFAULT}
                                        labelFor="field-select"
                                    >
                                        Policy Type
                                    </Label>
                                }
                            />
                        </div>
                    )}
                />
                <Controller
                    control={control}
                    name="policyState"
                    rules={{ required: true }}
                    render={({ field }) => (
                        <div>
                            <Select
                                options={policyStateOptions}
                                value={field.value}
                                id="policy-state-select"
                                onValueChange={field.onChange}
                                fieldSize={FieldSize.Small}
                                placeholder="Select Policy State"
                                label={
                                    <Label
                                        status={FieldStatus.DEFAULT}
                                        labelFor="policy-state-select"
                                    >
                                        Policy State
                                    </Label>
                                }
                            />
                        </div>
                    )}
                />
                <Controller
                    control={control}
                    name="email"
                    rules={{
                        required: true,
                        pattern: /^[\w.+-]+@[\w-]+(\.[\w-]{2,})+$/,
                    }}
                    render={({ field }) => (
                        <div>
                            <FieldData
                                fieldStatus={
                                    errors.email
                                        ? FieldStatus.ERROR
                                        : FieldStatus.DEFAULT
                                }
                                id="email"
                                fieldSize={FieldSize.Small}
                                onChange={field.onChange}
                                errorMessage="Please provide a valid email address"
                                value={field.value}
                                label={
                                    <Label
                                        status={FieldStatus.DEFAULT}
                                        labelFor="email"
                                    >
                                        Email
                                    </Label>
                                }
                            />
                        </div>
                    )}
                />
                <Controller
                    control={control}
                    name="firstName"
                    rules={{ required: true }}
                    render={({ field }) => (
                        <div>
                            <FieldData
                                fieldStatus={FieldStatus.DEFAULT}
                                id="firstName"
                                fieldSize={FieldSize.Small}
                                onChange={field.onChange}
                                placeholder="If empty, will use default from the sample XML files"
                                value={field.value}
                                label={
                                    <Label
                                        status={FieldStatus.DEFAULT}
                                        labelFor="firstName"
                                    >
                                        First Name
                                    </Label>
                                }
                            />
                        </div>
                    )}
                />
                <Controller
                    control={control}
                    name="lastName"
                    rules={{ required: true }}
                    render={({ field }) => (
                        <div>
                            <FieldData
                                fieldStatus={FieldStatus.DEFAULT}
                                id="lastName"
                                fieldSize={FieldSize.Small}
                                onChange={field.onChange}
                                placeholder="If empty, will use default from the sample XML files"
                                value={field.value}
                                label={
                                    <Label
                                        status={FieldStatus.DEFAULT}
                                        labelFor="lastName"
                                    >
                                        Last Name
                                    </Label>
                                }
                            />
                        </div>
                    )}
                />
                <Controller
                    control={control}
                    name="phoneNumber"
                    rules={{
                        required: true,
                        validate: (value) => {
                            if (!value) {
                                return false;
                            }
                            const pattern = /^\d{10}$/;
                            return (
                                pattern.test(value) ||
                                'Phone number must be a 10-digit number without any spaces or non-numeric characters'
                            );
                        },
                    }}
                    render={({ field }) => (
                        <div>
                            <FieldData
                                fieldStatus={
                                    errors.phoneNumber
                                        ? FieldStatus.ERROR
                                        : FieldStatus.DEFAULT
                                }
                                id="phoneNumber"
                                fieldSize={FieldSize.Small}
                                onChange={field.onChange}
                                placeholder="If empty, will use default from the sample XML files"
                                errorMessage={errors.phoneNumber?.message}
                                value={field.value}
                                label={
                                    <Label
                                        status={FieldStatus.DEFAULT}
                                        labelFor="phoneNumber"
                                    >
                                        Phone Number
                                    </Label>
                                }
                            />
                        </div>
                    )}
                />
                <Controller
                    control={control}
                    name="govtId"
                    rules={{
                        required: true,
                        validate: (value) => {
                            if (!value) {
                                return false;
                            }
                            const pattern = /^\d{9}$/;
                            return (
                                pattern.test(value) ||
                                'GovtID must be a 9-digit number without any spaces or non-numeric characters'
                            );
                        },
                    }}
                    render={({ field }) => (
                        <div>
                            <FieldData
                                fieldStatus={
                                    errors.govtId
                                        ? FieldStatus.ERROR
                                        : FieldStatus.DEFAULT
                                }
                                id="govtId"
                                fieldSize={FieldSize.Small}
                                onChange={field.onChange}
                                errorMessage="Please provide a valid GovtId"
                                placeholder="If empty, will use default from the sample XML files"
                                value={field.value}
                                label={
                                    <Label
                                        status={FieldStatus.DEFAULT}
                                        labelFor="govtId"
                                    >
                                        Government ID
                                    </Label>
                                }
                            />
                        </div>
                    )}
                />

                <Controller
                    control={control}
                    name="agent"
                    rules={{ required: true }}
                    render={({ field }) => (
                        <div>
                            <Select
                                options={agentSelectOptions}
                                value={field.value}
                                id="policy-agent-select"
                                onValueChange={(e) => {
                                    field.onChange(e);
                                    const agentInfo =
                                        agentValues[
                                            e as keyof typeof agentValues
                                        ];
                                    setValue(
                                        'agentFirstName',
                                        agentInfo?.firstName
                                    );
                                    setValue(
                                        'agentLastName',
                                        agentInfo?.lastName
                                    );
                                    setValue(
                                        'agentProducerKey',
                                        agentInfo?.producerKey
                                    );
                                    setValue(
                                        'agentLicenseNumber',
                                        agentInfo?.licenseNumber
                                    );
                                    setValue(
                                        'agentCompanyProducerID',
                                        agentInfo?.companyProducerID
                                    );
                                }}
                                fieldSize={FieldSize.Small}
                                placeholder="Select an agent"
                                label={
                                    <Label
                                        status={FieldStatus.DEFAULT}
                                        labelFor="policy-agent-select"
                                    >
                                        Agent
                                    </Label>
                                }
                            />
                        </div>
                    )}
                />
            </div>
            <div className={styles.buttonWrapper}>
                <Button
                    disabled={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                >
                    Add a policy
                </Button>
            </div>

            <p>
                Generated Policy Number:{' '}
                {isSubmitting ? (
                    'Processing..this could take up to 30 seconds'
                ) : response?.data ? (
                    <NavLink
                        target="_blank"
                        href={`/policies/${response?.data.planCode}/${response?.data.policyNumber}/policy/policy-details`}
                    >
                        /policies/{response?.data.planCode}/
                        {response?.data.policyNumber}/policy/policy-details
                    </NavLink>
                ) : (
                    ''
                )}
            </p>
            {error && <p>Error: {error}</p>}
            {response?.data.initialPremiumFailed && (
                <p>
                    Setting an initial premium for policy number{' '}
                    {response?.data.policyNumber} failed.
                </p>
            )}

            {response?.data.lifecycleFailed && (
                <p>
                    Life cycling policy number {response?.data.policyNumber}{' '}
                    failed.
                </p>
            )}
        </>
    );
};
