import router from 'next/router';
import { useTranslation } from 'next-i18next';
import { useContext, useMemo, useState } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import GlobalValuesBar from '@deps/components/global-values/global-values-bar/global-values-bar';
import { Program } from '@deps/components/otp-withdrawal-form/rmd-method/program-item';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { policyDataToGlobalValues } from '@deps/helpers/global-values';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { DocumentData } from '@deps/models/case/document';
import { ApiVersion } from '@deps/models/case/enums';
import { TaskApiVersionMapper } from '@deps/models/case/helpers';
import { TaskSource } from '@deps/models/case/task';
import { TaskStatus } from '@deps/models/case/task-instance';
import { ActiveWithdrawalCase, CaseStatus } from '@deps/models/case/withdrawal/case';
import { PartyRole, Policy } from '@deps/models/policy/sor-policy';
import { putCaseTask } from '@deps/queries/api/v1/task';
import { updateTask } from '@deps/queries/api/v2/task';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';

import EditProgram from './edit-program';
import { getSswEditPayload } from './ssw-edit-helper';

type SswUpdateContainerProps = {
    policy: Policy;
    document: DocumentData;
    program: any;
    setProgram?: any;
};

const SswUpdateContainer = ({ policy, document, program }: SswUpdateContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const { formSource, initialForm, formSignature } = useContext(FormDataContext);

    // const [showSSWEditTabs, setShowSSWEditTabs] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formError, setFormError] = useState(false);

    const [timer] = useState(performance.now());

    const globalValuesData = useMemo(() => policyDataToGlobalValues(new PolicyDetails(policy), t), [policy, t]);

    const { marketingName, planCode, policyNumber, productType, status, tooltip, variant } = globalValuesData;

    const policyOwnerId = policy?.partyRoles?.find(pr => pr.partyRole === PartyRole.OWNER)?.partyId;

    const policyOwner = policy?.parties?.find(party => party.partyId === policyOwnerId);

    const buildSSWFormData = (
        status: TaskStatus | CaseStatus,
        initialForm: ActiveWithdrawalCase,
        sswProgram: any,
        document: DocumentData,
        sswEditType: any
    ) => {
        return {
            source: TaskSource.ZinniaTaskManagement,
            taskType: initialForm.taskType,
            status,
            data: getSswEditPayload(initialForm, formSource, formSignature, sswProgram, document, sswEditType),
        };
    };

    const handleProgramTerminate = async (item: Program) => {
        let successfulCaseUpdate;
        const confirmCancel = window.confirm('Do you want to terminate program' as string);

        console.log(buildSSWFormData(TaskStatus.Completed, initialForm, item, document, 'ProgramTerminate') as any);
        if (confirmCancel) {
            if (TaskApiVersionMapper[initialForm.taskType] === ApiVersion.v2) {
                setIsLoading(true);
                successfulCaseUpdate = await updateTask(
                    initialForm.caseId,
                    initialForm?.taskId,
                    buildSSWFormData(TaskStatus.Completed, initialForm, item, document, 'ProgramTerminate') as any,
                    timer
                );
            } else {
                successfulCaseUpdate = await putCaseTask(
                    initialForm.taskType,
                    initialForm.taskId,
                    buildSSWFormData(TaskStatus.Completed, initialForm, item, document, 'ProgramTerminate') as any
                );
            }
        } else {
            return;
        }

        if (successfulCaseUpdate) {
            setIsLoading(false);
            setFormSubmitted(true);
        } else {
            setFormError(true);
        }
    };

    if (isLoading) {
        return (
            <div className="responsive-padding flex h-[300px] w-full grow">
                <PageLoader variant={PageLoaderVariant.Center} />
            </div>
        );
    }

    if (formError) {
        return (
            <ApiErrorCard
                leaveRoute={'/create-case'}
                submit={{
                    action: () => {
                        router.reload();
                    },
                    text: 'tryAgain',
                }}
            />
        );
    }
    return (
        <>
            <div className="workflow-height-adjusted flex w-full max-w-[1130px] grow flex-col self-center bg-gray-100 py-4 my-2">
                <div className="flex">
                    <GlobalValuesBar
                        carrierId={initialForm.carrier}
                        marketingName={marketingName}
                        owner={policyOwner}
                        planCode={planCode}
                        policyNumber={policyNumber}
                        productType={productType}
                        status={status}
                        tooltip={tooltip}
                        variant={variant}
                        showJointOwner={false}
                        showDocument={false}
                        showLink={false}
                    />
                </div>
                <div className="my-2 flex w-full grow flex-col rounded bg-white shadow-elevation-light-04 p-6">
                    {program.length === 0 && (
                        <div className="flex justify-center items-center py-20">
                            <CardInfo
                                cta={{
                                    action: () => {
                                        router.back();
                                    },
                                    text: 'back',
                                }}
                                title={'No Existing Program Found'}
                            />
                        </div>
                    )}

                    {!formSubmitted &&
                        program?.map((item: Program, index: number) => (
                            <EditProgram key={index} program={item} onTerminate={handleProgramTerminate} />
                        ))}
                    {/* {showSSWEditTabs && (
                        <SswEditTabsContainer
                            policy={policy}
                            document={document}
                            program={program}
                            rmdPrograms={rmdPrograms}
                            setsswprograms={setsswprograms}
                            setrmdPrograms={setrmdPrograms}
                        />
                    )} */}
                    {formSubmitted && (
                        <div className="flex justify-center items-center py-20">
                            <CardInfo
                                icon={<CircleCheckIcon className="text-semantic-success" height={50} width={50} />}
                                cta={{
                                    action: () => {
                                        router.push('/create-case');
                                    },
                                    text: t('sswUpdate.close'),
                                }}
                                subtitle={' SSW Request has been submitted.'}
                                title={t('sswUpdate.submitted')}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SswUpdateContainer;
