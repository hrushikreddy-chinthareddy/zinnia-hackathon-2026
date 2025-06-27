import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import { Program } from '@deps/components/otp-withdrawal-form/rmd-method/program-item';
import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { FormSignature } from '@deps/models/case/withdrawal/case';

import { SswUpdateType, UpdatedProgram } from '../../ssw-edit-helpers';

type SummaryProps = {
    currentProgram: Program;
    updatedProgram: UpdatedProgram;
    onContinue: (
        item: Program,
        operationType: SswUpdateType,
        formSign: FormSignature
    ) => void;
};

const Summary = ({
    currentProgram,
    updatedProgram,
    onContinue,
}: SummaryProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'sswUpdate.tabs.summary',
    });
    const { goToNext } = useWorkflow();
    const { formSignature } = useContext(FormDataContext);
    const signObj = structuredClone(formSignature);

    const handleSubmitSswUpdate = () => {
        onContinue(currentProgram, SswUpdateType.PROGRAM_UPDATE, signObj);
        goToNext();
    };

    return (
        <WorkflowCard
            title={t('tabTitle')}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-10"
                    disableContinue={false}
                    handleContinue={handleSubmitSswUpdate}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink="/create-case"
                />
            }
        >
            <p className="mb-3 font-primary text-sm">{t('reviewMessage')}</p>
            <div className="grid grid-cols-2 gap-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell>{''}</TableHeaderCell>
                            <TableHeaderCell>
                                <Content
                                    details={t('updatedProgram') as string}
                                    variant={ContentVariant.BodySmBold}
                                />
                            </TableHeaderCell>
                            <TableHeaderCell>
                                <Content
                                    details={t('current') as string}
                                    variant={ContentVariant.BodySmBold}
                                />
                            </TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <Content
                                    details={t('amount') as string}
                                    variant={ContentVariant.BodySm}
                                />
                            </TableCell>
                            <TableCell>
                                <Content
                                    details={updatedProgram?.amount || ''}
                                    variant={ContentVariant.BodySm}
                                />
                            </TableCell>
                            <TableCell>
                                <Content
                                    details={currentProgram?.amount}
                                    variant={ContentVariant.BodySm}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <Content
                                    details={t('frequency') as string}
                                    variant={ContentVariant.BodySm}
                                />
                            </TableCell>
                            <TableCell>
                                <Content
                                    details={updatedProgram?.frequency || ''}
                                    variant={ContentVariant.BodySm}
                                />
                            </TableCell>
                            <TableCell>
                                <Content
                                    details={currentProgram?.frequency}
                                    variant={ContentVariant.BodySm}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <Content
                                    details={t('duration') as string}
                                    variant={ContentVariant.BodySm}
                                />
                            </TableCell>
                            <TableCell>
                                <Content
                                    details={updatedProgram?.duration || ''}
                                    variant={ContentVariant.BodySm}
                                />
                            </TableCell>
                            <TableCell>
                                <Content
                                    details={currentProgram?.duration}
                                    variant={ContentVariant.BodySm}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <Content
                                    details={t('nextDate') as string}
                                    variant={ContentVariant.BodySm}
                                />
                            </TableCell>
                            <TableCell>
                                <Content
                                    details={updatedProgram?.nextDate || ''}
                                    variant={ContentVariant.BodySm}
                                />
                            </TableCell>
                            <TableCell>
                                <Content
                                    details={currentProgram?.nextDate}
                                    variant={ContentVariant.BodySm}
                                />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </WorkflowCard>
    );
};

export default Summary;
