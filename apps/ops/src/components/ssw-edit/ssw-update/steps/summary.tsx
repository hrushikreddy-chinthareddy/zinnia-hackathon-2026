import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import { Program } from '@deps/components/otp-withdrawal-form/rmd-method/program-item';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';

import { SswUpdateType } from '../../ssw-edit-helper';

type SummaryProps = {
    currentProgram: Program;
    updatedProgram: Program | any;
    onContinue: any;
};

const Summary = ({ currentProgram, updatedProgram, onContinue }: SummaryProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'sswUpdate.tabs.summary' });

    const handleSubmitSswUpdate = () => {
        onContinue(currentProgram, SswUpdateType.PROGRAM_UPDATE);
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
                                <Content details={t('updatedProgram') as string} variant={ContentVariant.BodySmBold} />
                            </TableHeaderCell>
                            <TableHeaderCell>
                                <Content details={t('current') as string} variant={ContentVariant.BodySmBold} />
                            </TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <Content details={'Amount'} variant={ContentVariant.BodySm} />
                            </TableCell>
                            <TableCell>
                                <Content details={updatedProgram?.amount || ''} variant={ContentVariant.BodySm} />
                            </TableCell>
                            <TableCell>
                                <Content details={currentProgram?.amount} variant={ContentVariant.BodySm} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <Content details={'Frequency'} variant={ContentVariant.BodySm} />
                            </TableCell>
                            <TableCell>
                                <Content details={updatedProgram?.frequency || ''} variant={ContentVariant.BodySm} />
                            </TableCell>
                            <TableCell>
                                <Content details={currentProgram?.frequency} variant={ContentVariant.BodySm} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <Content details={'Duration'} variant={ContentVariant.BodySm} />
                            </TableCell>
                            <TableCell>
                                <Content details={updatedProgram?.duration || ''} variant={ContentVariant.BodySm} />
                            </TableCell>
                            <TableCell>
                                <Content details={currentProgram?.duration} variant={ContentVariant.BodySm} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <Content details={'Next Date'} variant={ContentVariant.BodySm} />
                            </TableCell>
                            <TableCell>
                                <Content details={updatedProgram?.nextDate || ''} variant={ContentVariant.BodySm} />
                            </TableCell>
                            <TableCell>
                                <Content details={currentProgram?.nextDate} variant={ContentVariant.BodySm} />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </WorkflowCard>
    );
};

export default Summary;
