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

function generateFarmersAgentsArray(agents: Record<string, Agent>) {
    return Object.entries(agents).map(([key, agent]) => ({
        textValue: `${key} ${agent.firstName} ${agent.lastName}`,
        value: key,
    }));
}

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

interface Agent {
    firstName: string;
    lastName: string;
    producerKey: string;
    licenseNumber: string;
    companyProducerID: string;
}

const farmersAgents: Record<string, Agent> = {
    '1020977': {
        firstName: 'Johnny',
        lastName: 'Fitzmaurice',
        producerKey: '99112J1020977',
        licenseNumber: '',
        companyProducerID: '99112J1020977',
    },
    '23901': {
        firstName: '',
        lastName: '',
        producerKey: '8410123901',
        licenseNumber: '',
        companyProducerID: '',
    },
    '26998': {
        firstName: 'Josephine',
        lastName: 'Hanan',
        producerKey: '14887326998',
        licenseNumber: '',
        companyProducerID: '14887326998',
    },
    '761139': {
        firstName: 'Brenda',
        lastName: 'Hickman',
        producerKey: '180401761139',
        licenseNumber: '',
        companyProducerID: '180401761139',
    },
    '885771': {
        firstName: 'Michael',
        lastName: 'Barclay',
        producerKey: '298201885771',
        licenseNumber: '',
        companyProducerID: '298201885771',
    },
    '972915': {
        firstName: 'William',
        lastName: 'Brown',
        producerKey: '357401972915',
        licenseNumber: '',
        companyProducerID: '357401972915',
    },
    '1029126': {
        firstName: 'JEFFREY',
        lastName: 'GUTHALS',
        producerKey: '3574741029126',
        licenseNumber: '',
        companyProducerID: '3574741029126',
    },
    '747676': {
        firstName: 'Dolores',
        lastName: 'Rosales Valenzuela',
        producerKey: '357474747676',
        licenseNumber: '',
        companyProducerID: '357474747676',
    },
    '21051': {
        firstName: 'Giovanna',
        lastName: 'Ramirez',
        producerKey: '71734021051',
        licenseNumber: '',
        companyProducerID: '71734021051',
    },
    '1002799': {
        firstName: 'Jay',
        lastName: 'Everidge',
        producerKey: '7907561002799',
        licenseNumber: '',
        companyProducerID: '7907561002799',
    },
    '989296': {
        firstName: 'Michael',
        lastName: 'Brady',
        producerKey: '889931989296',
        licenseNumber: '',
        companyProducerID: '889931989296',
    },
    '98844': {
        firstName: 'Denitra',
        lastName: 'Lockhart',
        producerKey: '95170198844',
        licenseNumber: '',
        companyProducerID: '95170198844',
    },
    '994133': {
        firstName: 'Rodrigo',
        lastName: 'salas',
        producerKey: '951749994133',
        licenseNumber: '',
        companyProducerID: '951749994133',
    },
    '54077': {
        firstName: 'Colin',
        lastName: 'Lovett',
        producerKey: '95174954077',
        licenseNumber: '',
        companyProducerID: '95174954077',
    },
    '1541079': {
        firstName: 'Stephanie',
        lastName: 'Patino',
        producerKey: '9744761541079',
        licenseNumber: '',
        companyProducerID: '9744761541079',
    },
    '37877': {
        firstName: 'Kerri',
        lastName: 'Watercutter',
        producerKey: '97447637877',
        licenseNumber: '',
        companyProducerID: '97447637877',
    },
    '884728': {
        firstName: 'Donald',
        lastName: 'Wagner',
        producerKey: '991101884728',
        licenseNumber: '',
        companyProducerID: '991101884728',
    },
    '1026121': {
        firstName: 'JOHN',
        lastName: 'HENNESSEY',
        producerKey: '06093M1026121',
        licenseNumber: '',
        companyProducerID: '06093M1026121',
    },
    '1001192': {
        firstName: 'Sylvia',
        lastName: 'Willson',
        producerKey: '0609J31001192',
        licenseNumber: '',
        companyProducerID: '0609J31001192',
    },
    '1013967': {
        firstName: 'Denise',
        lastName: 'Scott',
        producerKey: '0715AF1013967',
        licenseNumber: '',
        companyProducerID: '0715AF1013967',
    },
    '1134661': {
        firstName: 'Danielle',
        lastName: 'Neble',
        producerKey: '08081V1134661',
        licenseNumber: '',
        companyProducerID: '08081V1134661',
    },
    '1022333': {
        firstName: 'Ryan',
        lastName: 'Jolly',
        producerKey: '18048V1022333',
        licenseNumber: '',
        companyProducerID: '18048V1022333',
    },
    '10001': {
        firstName: 'Jay',
        lastName: 'Strickland',
        producerKey: '19257A10001',
        licenseNumber: '',
        companyProducerID: '19257A10001',
    },
    '15062': {
        firstName: 'Chase',
        lastName: 'Barney',
        producerKey: '19677T15062',
        licenseNumber: '',
        companyProducerID: '19677T15062',
    },
    '1490826': {
        firstName: 'Mathew',
        lastName: 'Knight',
        producerKey: '2223EF1490826',
        licenseNumber: '',
        companyProducerID: '2223EF1490826',
    },
    '1028816': {
        firstName: 'Gary',
        lastName: 'Fischer',
        producerKey: '35205F1028816',
        licenseNumber: '',
        companyProducerID: '35205F1028816',
    },
    '886050': {
        firstName: 'LUAN',
        lastName: 'HO',
        producerKey: '35206M886050',
        licenseNumber: '',
        companyProducerID: '35206M886050',
    },
    '108748': {
        firstName: 'Jeffrey',
        lastName: 'Coppola',
        producerKey: '35766M108748',
        licenseNumber: '',
        companyProducerID: '35766M108748',
    },
    '1024455': {
        firstName: 'DONNA',
        lastName: 'KRAMER',
        producerKey: '3660CX1024455',
        licenseNumber: '',
        companyProducerID: '3660CX1024455',
    },
    '1236874': {
        firstName: 'Tihomir',
        lastName: 'Vujatov',
        producerKey: '3660CX1236874',
        licenseNumber: '',
        companyProducerID: '3660CX1236874',
    },
    '1464470': {
        firstName: 'Tyler',
        lastName: 'Barnes',
        producerKey: '6722CF1464470',
        licenseNumber: '',
        companyProducerID: '6722CF1464470',
    },
    '1029420': {
        firstName: 'John',
        lastName: 'Reed',
        producerKey: '71159C1029420',
        licenseNumber: '',
        companyProducerID: '71159C1029420',
    },
    '16194': {
        firstName: 'meng',
        lastName: 'chang',
        producerKey: '71159C16194',
        licenseNumber: '',
        companyProducerID: '71159C16194',
    },
    '1028000': {
        firstName: 'Renne',
        lastName: 'Lehmann',
        producerKey: '7173F61028000',
        licenseNumber: '',
        companyProducerID: '7173F61028000',
    },
    '1267610': {
        firstName: 'Kevin',
        lastName: 'Anderson',
        producerKey: '7309AK1267610',
        licenseNumber: '',
        companyProducerID: '7309AK1267610',
    },
    '1110079': {
        firstName: 'Michael',
        lastName: 'Monju',
        producerKey: '7309KH1110079',
        licenseNumber: '',
        companyProducerID: '7309KH1110079',
    },
    '105082': {
        firstName: 'Craig',
        lastName: 'Smith',
        producerKey: '88115V105082',
        licenseNumber: '',
        companyProducerID: '88115V105082',
    },
    '82412': {
        firstName: 'Laura',
        lastName: 'Servin',
        producerKey: '88116K82412',
        licenseNumber: '',
        companyProducerID: '88116K82412',
    },
    '1483185': {
        firstName: 'George',
        lastName: 'Mandas',
        producerKey: '88116K1483185',
        licenseNumber: '',
        companyProducerID: '88116K1483185',
    },
    '1011456': {
        firstName: 'Anm',
        lastName: 'Badruddoza',
        producerKey: '95312V1011456',
        licenseNumber: '',
        companyProducerID: '95312V1011456',
    },
    '33060': {
        firstName: 'Diane',
        lastName: 'Shopteau',
        producerKey: '96659C33060',
        licenseNumber: '',
        companyProducerID: '96659C33060',
    },
    '1214899': {
        firstName: 'Robert',
        lastName: 'Carolla',
        producerKey: '9665A61214899',
        licenseNumber: '',
        companyProducerID: '9665A61214899',
    },
};

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
        ? [...generateFarmersAgentsArray(farmersAgents)]
        : []),
];

const defaultAgent = isEvglDemo()
    ? { agent: 'Agent1', ...evergladesAgents.Agent1 }
    : { agent: '1020977', ...farmersAgents['1020977'] };

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
