import { Table, TableHeader, TableHeaderCell, TableRow, TableBody, TableCell } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import Content, { ContentVariant } from '@deps/components/content/content';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/documents-content';
import { createAction } from '@deps/containers/subpages/documents-sub-page/documents-results-table';
import { PolicyDocument } from '@deps/models/case/document';

type StatementListingProps = {
    statements: PolicyDocument[];
    carrierId: string;
};
const StatementListing = ({ statements, carrierId }: StatementListingProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: '' });

    return (
        <>
            {statements?.length > 0 ? (
                <>
                    <Content details={t('contactCenter.statementDetails.title') as string} variant={ContentVariant.BodyBold} />
                    <Table className="my-4">
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell>
                                    <Content
                                        details={t('contactCenter.statementDetails.name') as string}
                                        variant={ContentVariant.BodySmBold}
                                    />
                                </TableHeaderCell>

                                <TableHeaderCell>
                                    <Content
                                        details={t('contactCenter.statementDetails.createdDate') as string}
                                        variant={ContentVariant.BodySmBold}
                                    />
                                </TableHeaderCell>
                                <TableHeaderCell>
                                    <Content
                                        details={t('contactCenter.statementDetails.periodYear') as string}
                                        variant={ContentVariant.BodySmBold}
                                    />
                                </TableHeaderCell>
                                <TableHeaderCell>
                                    <Content
                                        details={t('contactCenter.statementDetails.periodQuarter') as string}
                                        variant={ContentVariant.BodySmBold}
                                    />
                                </TableHeaderCell>
                                <TableHeaderCell>
                                    <></>
                                </TableHeaderCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {statements?.map((statement, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Content details={statement.displayName} variant={ContentVariant.BodySm} />
                                    </TableCell>

                                    <TableCell>
                                        <Content
                                            details={dayjs(statement.importDate).format('DD/MM/YYYY')}
                                            variant={ContentVariant.BodySm}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Content details={statement.periodYear || ''} variant={ContentVariant.BodySm} />
                                    </TableCell>
                                    <TableCell>
                                        <Content details={statement.periodQuarter || ''} variant={ContentVariant.BodySm} />
                                    </TableCell>
                                    <TableCell>
                                        {createAction({ ...statement, documentSource: DocumentTypeView.Correspondence }, carrierId, t, 'contactCenter.sendStatement.viewStatement' )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <PiiWrapper className="mt-4">
                        <span>{t('contactCenter.statementDetails.warning.0')}</span>{' '}
                        <span>{t('contactCenter.statementDetails.warning.1')}</span>
                    </PiiWrapper>
                </>
            ) : (
                <Content details={t('contactCenter.statementDetails.noStatements') as string} variant={ContentVariant.BodySm} />
            )}
        </>
    );
};

export default StatementListing;
